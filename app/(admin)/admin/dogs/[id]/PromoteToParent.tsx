'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { promoteToParent } from './edit/actions';

/**
 * 仔犬を親犬（在籍）にする。
 *
 * 確認は画面内の2段階。押し間違えると仔犬一覧から消えて販売の対象から外れるため、
 * 何が起きるかを文章で出してから実行する。
 */
export function PromoteToParent({
  dogId,
  dogName,
  sex,
  isPublished,
}: {
  dogId: string;
  dogName: string;
  sex: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const role = sex === '♀' ? '母犬' : '種雄犬';

  async function run() {
    setBusy(true);
    setErr('');
    const res = await promoteToParent(dogId);
    setBusy(false);
    if (!res.ok) {
      setErr(res.message);
      setAsking(false);
      return;
    }
    router.refresh();
    setAsking(false);
  }

  return (
    <div className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3">
      {asking ? (
        <>
          <p className="text-[13px] font-bold leading-relaxed">
            {dogName} を{role}（在籍）にします。よろしいですか。
          </p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-adm-muted">
            仔犬一覧から外れ、犬一覧の「{sex === '♀' ? '♀ 母犬' : '♂ 種雄犬'}」に入ります。
            {isPublished && ' サイトの公開も止まります。'}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={run}
              disabled={busy}
              className="tap flex-1 rounded-xl bg-adm-action px-4 py-3 text-[14px] font-bold text-white disabled:opacity-40"
            >
              {busy ? '処理中…' : `${role}にする`}
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
          className="tap flex w-full items-center justify-center rounded-xl border border-adm-rule px-4 py-2.5 text-[13.5px] font-medium text-adm-action"
        >
          この子を{role}にする（繁殖に残す）
        </button>
      )}

      {err && <p className="mt-2 text-[12px] leading-relaxed text-adm-danger">{err}</p>}

      <p className="mt-2.5 text-[11.5px] leading-relaxed text-adm-muted">
        販売せずにこの犬舎で繁殖に使う子はここから親犬にします。状態が「在籍」になり、出産記録の母犬・父犬として選べるようになります。
      </p>
    </div>
  );
}
