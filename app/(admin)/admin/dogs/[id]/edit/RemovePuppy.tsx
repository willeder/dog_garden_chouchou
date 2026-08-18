'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { removePuppy } from '@/app/(admin)/admin/puppies/actions';

/**
 * 間違えて作った仔犬の登録を取り消す。
 *
 * 確認は画面内の2段階にしている。ブラウザの確認ダイアログは押し間違えやすく、
 * 何を消そうとしているのかが文章で出せない。
 *
 * 【法令】亡くなった子はここでは消さない。状態を「死亡」にして死亡日を入れる。
 * 死亡は帳簿に5年間残さなければならないので、サーバ側でも弾いている。
 */
export function RemovePuppy({ dogId, dogName }: { dogId: string; dogName: string }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function run() {
    setBusy(true);
    setErr('');
    const res = await removePuppy(dogId);
    setBusy(false);
    if (!res.ok) {
      setErr(res.message);
      setAsking(false);
      return;
    }
    router.push('/admin/puppies');
    router.refresh();
  }

  return (
    <section className="px-4 pt-3.5">
      <h2 className="mb-2 text-[13px] font-bold tracking-wide">この子の登録</h2>
      <div className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3">
        {asking ? (
          <>
            <p className="text-[13px] font-bold leading-relaxed">
              {dogName} の登録を取り消します。よろしいですか。
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-adm-muted">
              一覧から消え、出産記録の頭数も1つ減ります。
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
            登録を取り消す
          </button>
        )}

        {err && <p className="mt-2 text-[12px] leading-relaxed text-adm-danger">{err}</p>}

        <p className="mt-2.5 text-[11.5px] leading-relaxed text-adm-muted">
          <b className="text-adm-ink">間違えて登録した子を消すためのものです。</b>
          亡くなった子はここではなく、上の「状態」を「死亡」にして死亡日を入れてください。
          死亡の記録は帳簿に5年間残す必要があります。
        </p>
      </div>
    </section>
  );
}
