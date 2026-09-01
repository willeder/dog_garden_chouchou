'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { removeLitter } from './actions';

/**
 * 間違えて登録した出産記録を取り消す。
 *
 * 確認は画面内の2段階にしている。ブラウザの確認ダイアログは押し間違えやすく、
 * 何を消そうとしているのかが文章で出せない。
 *
 * 仔犬が1頭でもぶら下がっているときはボタンを出さない。
 * 取り消すと仔犬が腹不明で宙に浮き、帳簿の辻褄が合わなくなる。
 *
 * 【法令】5年保存があるため物理削除はしない。台帳からは消えるが行は残る。
 */
export function RemoveLitter({
  litterId,
  label,
  blockedReason,
}: {
  litterId: string;
  /** 「クッキー 2026/03/01」のような、何を消すのかが分かる文字列 */
  label: string;
  /** 取り消せない理由。あるときはボタンを出さずこれを出す */
  blockedReason?: string;
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function run() {
    setBusy(true);
    setErr('');
    const res = await removeLitter(litterId);
    setBusy(false);
    if (!res.ok) {
      setErr(res.message);
      setAsking(false);
      return;
    }
    router.push(`/admin/dogs/${res.damId}?t=${encodeURIComponent('出産')}`);
    router.refresh();
  }

  return (
    <section className="px-4 pt-3.5">
      <h2 className="mb-2 text-[13px] font-bold tracking-wide">この出産の記録</h2>
      <div className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3">
        {blockedReason ? (
          <p className="text-[12.5px] leading-relaxed text-adm-muted">{blockedReason}</p>
        ) : asking ? (
          <>
            <p className="text-[13px] font-bold leading-relaxed">
              {label} の出産記録を取り消します。よろしいですか。
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-adm-muted">
              母犬のカルテから消え、出産回数・次回交配可能月の計算からも外れます。
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={run}
                disabled={busy}
                className="tap flex-1 rounded-xl bg-adm-danger px-4 py-3 text-[14px] font-bold text-white disabled:opacity-40"
              >
                {busy ? '処理中…' : '取り消す'}
              </button>
              <button
                type="button"
                onClick={() => setAsking(false)}
                disabled={busy}
                className="tap flex-1 rounded-xl border border-adm-rule px-4 py-3 text-[14px] disabled:opacity-40"
              >
                やめる
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setAsking(true)}
            className="tap flex w-full items-center justify-center rounded-xl border border-[#E3C9C7] px-4 py-2.5 text-[13.5px] font-medium text-adm-danger"
          >
            この出産記録を取り消す
          </button>
        )}

        {err && <p className="mt-2 text-[12px] leading-relaxed text-adm-danger">{err}</p>}

        <p className="mt-2.5 text-[11.5px] leading-relaxed text-adm-muted">
          <b className="text-adm-ink">間違えて登録した記録を消すためのものです。</b>
          日付や頭数の打ち間違いは、消さずに上で直してください。
        </p>
      </div>
    </section>
  );
}
