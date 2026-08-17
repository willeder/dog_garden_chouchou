'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/client';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PUBLIC_BYTES,
  PRIVATE_BUCKET,
  PUBLIC_BUCKET,
  newPhotoPath,
  publicPhotoUrl,
  type PhotoBucket,
} from '@/app/_lib/supabase/storage';

export type PhotoItem = {
  id: string;
  bucket: string;
  path: string;
  width: number;
  height: number;
  sort_order: number;
  /** 非公開バケットは署名URL。公開バケットは固定URL */
  url: string;
};

/**
 * 犬の写真の管理。
 *
 * バケットを2つに分けているのは、公開してよい写真と犬舎内の記録を
 * 同じ場所に置かないため。取り違えると、出す気のない写真がサイトに出る。
 *   dogs-public  … 公式サイトに出す。親犬は仔犬詳細の「両親」に出る
 *   dogs-private … 犬舎内の記録。サイトには出ない
 */
export function PhotoManager({
  dogId,
  dogName,
  publicPhotos,
  privatePhotos,
}: {
  dogId: string;
  dogName: string;
  publicPhotos: PhotoItem[];
  privatePhotos: PhotoItem[];
}) {
  return (
    <>
      <Section
        dogId={dogId}
        dogName={dogName}
        bucket={PUBLIC_BUCKET}
        title="サイト用"
        note="公式サイトに出ます"
        help="1枚目がメイン写真になります。親犬の写真は、仔犬詳細の「両親」欄に出ます。"
        photos={publicPhotos}
      />
      <Section
        dogId={dogId}
        dogName={dogName}
        bucket={PRIVATE_BUCKET}
        title="記録用"
        note="サイトには出ません"
        help="犬舎内の記録用です。体調の記録や書類の控えなど、外に出さないものはこちらへ。"
        photos={privatePhotos}
      />
    </>
  );
}

function Section({
  dogId,
  dogName,
  bucket,
  title,
  note,
  help,
  photos,
}: {
  dogId: string;
  dogName: string;
  bucket: PhotoBucket;
  title: string;
  note: string;
  help: string;
  photos: PhotoItem[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [, startTransition] = useTransition();
  const router = useRouter();

  const refresh = () => startTransition(() => router.refresh());

  async function upload(files: FileList) {
    setError('');
    setDone('');
    setBusy(true);
    const supabase = createClient();

    try {
      for (const file of Array.from(files)) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
          throw new Error(`${file.name} は対応していない形式です（JPEG / PNG / WebP / AVIF）`);
        }
        if (bucket === PUBLIC_BUCKET && file.size > MAX_PUBLIC_BYTES) {
          throw new Error(`${file.name} は10MBを超えています`);
        }

        // 幅と高さを先に測る。サイト側で画像の場所を先に確保でき、
        // 読み込み中に文字が飛ぶのを防げる。
        const { width, height } = await readSize(file);
        const path = newPhotoPath(dogId, file.name);

        const up = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (up.error) throw new Error(`アップロードできませんでした: ${up.error.message}`);

        const ins = await supabase.from('dog_photos').insert({
          dog_id: dogId,
          bucket,
          path,
          width,
          height,
          // 末尾に足す。1枚目をメインにしたいときは「メインにする」で入れ替える
          sort_order: photos.length > 0 ? Math.max(...photos.map((p) => p.sort_order)) + 1 : 0,
        });
        if (ins.error) {
          // 行を作れなかったら、置いたファイルも消す。孤児を残さない。
          await supabase.storage.from(bucket).remove([path]);
          throw new Error(`登録できませんでした: ${ins.error.message}`);
        }
      }
      setDone(`${files.length}枚を追加しました`);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '追加できませんでした');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function makeMain(photo: PhotoItem) {
    setBusy(true);
    setError('');
    const supabase = createClient();
    // 選んだ1枚を先頭に、残りを後ろへ詰め直す
    const rest = photos.filter((p) => p.id !== photo.id);
    const updates = [
      supabase.from('dog_photos').update({ sort_order: 0 }).eq('id', photo.id),
      ...rest.map((p, i) =>
        supabase.from('dog_photos').update({ sort_order: i + 1 }).eq('id', p.id),
      ),
    ];
    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed?.error) setError(`並べ替えできませんでした: ${failed.error.message}`);
    else setDone('メイン写真を変えました');
    setBusy(false);
    refresh();
  }

  async function remove(photo: PhotoItem) {
    setBusy(true);
    setError('');
    const supabase = createClient();
    const del = await supabase.from('dog_photos').delete().eq('id', photo.id);
    if (del.error) {
      setError(`削除できませんでした: ${del.error.message}`);
      setBusy(false);
      return;
    }
    // ファイル側の削除は失敗しても致命的ではない（一覧には出なくなる）。
    await supabase.storage.from(photo.bucket).remove([photo.path]);
    setDone('1枚削除しました');
    setBusy(false);
    refresh();
  }

  return (
    <section className="px-4 pt-3.5">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-[13px] font-bold tracking-wide">
          {title}
          <span className="ml-2 font-normal text-adm-muted">{note}</span>
        </h2>
        <span className="num text-[12px] text-adm-muted">{photos.length}枚</span>
      </div>

      {photos.length === 0 ? (
        <p className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 text-[12.5px] text-adm-muted">
          まだ登録がありません。
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <li key={p.id} className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
              {/* next/image を使わない。非公開バケットの署名URLは有効期限で変わるため */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={`${dogName} の写真 ${i + 1}枚目`}
                width={p.width}
                height={p.height}
                className="aspect-square w-full bg-adm-paper object-cover"
                loading="lazy"
              />
              <div className="flex items-center justify-between gap-1 px-1.5 py-1">
                {i === 0 ? (
                  <span className="num text-[10px] font-bold text-adm-action">メイン</span>
                ) : (
                  <button
                    onClick={() => makeMain(p)}
                    disabled={busy}
                    className="text-[10.5px] text-adm-action underline underline-offset-2 disabled:opacity-40"
                  >
                    メインに
                  </button>
                )}
                <button
                  onClick={() => remove(p)}
                  disabled={busy}
                  aria-label={`${i + 1}枚目を削除`}
                  className="text-[10.5px] text-adm-danger underline underline-offset-2 disabled:opacity-40"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={(e) => e.target.files?.length && upload(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="tap mt-2 w-full rounded-xl border border-adm-rule bg-adm-surface px-4 py-2.5 text-[13.5px] font-medium text-adm-action disabled:opacity-40"
      >
        {busy ? '処理中…' : '＋ 写真を追加'}
      </button>

      {error && <p className="mt-2 text-[12px] text-adm-danger">{error}</p>}
      {!error && done && <p className="mt-2 text-[12px] text-adm-action">{done}</p>}

      <p className="mt-2 text-[11.5px] leading-relaxed text-adm-muted">{help}</p>
    </section>
  );
}

/** 画像の幅と高さを読む。EXIFの回転は考慮しない（表示側で object-cover するため） */
function readSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} を画像として読めませんでした`));
    };
    img.src = url;
  });
}

export { publicPhotoUrl };
