'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/client';
import {
  ACCEPTED_VIDEO_TYPES,
  MAX_VIDEO_BYTES,
  VIDEO_BUCKET,
  newVideoPath,
} from '@/app/_lib/supabase/storage';
import { setDogVideo } from './videoActions';

/**
 * サイトに出す動画（1頭1本・任意）。写真とは別枠。
 *
 * 1本だけにしているのは、通信量と容量を抑えるため。
 * 差し替えると前の動画は消える。
 */
export function VideoManager({
  dogId,
  dogName,
  videoUrl,
}: {
  dogId: string;
  dogName: string;
  /** 登録済みの動画のURL。なければ null */
  videoUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [asking, setAsking] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function upload(file: File) {
    setError('');
    setDone('');
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type as (typeof ACCEPTED_VIDEO_TYPES)[number])) {
      setError(`${file.name} は対応していない形式です（MP4 / MOV / WebM）`);
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(`${file.name} は50MBを超えています（${Math.ceil(file.size / 1024 / 1024)}MB）。短く切るか画質を下げてください`);
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const path = newVideoPath(dogId, file.name);
    try {
      const up = await supabase.storage.from(VIDEO_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
      if (up.error) throw new Error(`アップロードできませんでした: ${up.error.message}`);

      const res = await setDogVideo(dogId, path);
      if (!res.ok) {
        // 列を付け替えられなかったら、置いたファイルも消す。孤児を残さない
        await supabase.storage.from(VIDEO_BUCKET).remove([path]);
        throw new Error(res.message);
      }
      setDone(videoUrl ? '動画を差し替えました' : '動画を追加しました');
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : '追加できませんでした');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function remove() {
    setBusy(true);
    setError('');
    setDone('');
    const res = await setDogVideo(dogId, null);
    setBusy(false);
    setAsking(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setDone('動画を外しました');
    startTransition(() => router.refresh());
  }

  return (
    <section className="px-4 pt-3.5">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-[13px] font-bold tracking-wide">
          サイト用の動画
          <span className="ml-2 font-normal text-adm-muted">公式サイトに出ます・任意</span>
        </h2>
        <span className="num text-[12px] text-adm-muted">{videoUrl ? '1本' : 'なし'}</span>
      </div>

      {videoUrl ? (
        <div className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            aria-label={`${dogName} の動画`}
            className="aspect-video w-full bg-black"
          />
          <div className="flex items-center justify-end gap-3 px-3 py-2">
            {asking ? (
              <>
                <span className="mr-auto text-[12px] font-bold">この動画を外しますか</span>
                <button
                  onClick={remove}
                  disabled={busy}
                  className="text-[12px] font-bold text-adm-danger underline underline-offset-2 disabled:opacity-40"
                >
                  外す
                </button>
                <button
                  onClick={() => setAsking(false)}
                  disabled={busy}
                  className="text-[12px] text-adm-muted underline underline-offset-2 disabled:opacity-40"
                >
                  やめる
                </button>
              </>
            ) : (
              <button
                onClick={() => setAsking(true)}
                disabled={busy}
                className="text-[12px] text-adm-danger underline underline-offset-2 disabled:opacity-40"
              >
                動画を外す
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 text-[12.5px] text-adm-muted">
          動画はまだありません。なくてもサイトには出せます。
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_VIDEO_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="tap mt-2 w-full rounded-xl border border-adm-rule bg-adm-surface px-4 py-2.5 text-[13.5px] font-medium text-adm-action disabled:opacity-40"
      >
        {busy ? 'アップロード中…（そのままお待ちください）' : videoUrl ? '動画を差し替える' : '＋ 動画を追加'}
      </button>

      {error && <p className="mt-2 text-[12px] text-adm-danger">{error}</p>}
      {!error && done && <p className="mt-2 text-[12px] text-adm-action">{done}</p>}

      <p className="mt-2 text-[11.5px] leading-relaxed text-adm-muted">
        1頭につき1本、50MBまで（MP4 / MOV / WebM）。スマホで撮った30秒〜1分程度が目安です。
        差し替えると前の動画は消えます。
      </p>
    </section>
  );
}
