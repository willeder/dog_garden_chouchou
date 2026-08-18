'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addPuppy } from './actions';

/**
 * 腹に仔犬を1頭足すボタン。
 *
 * ♂♀を選ばせる画面は挟まない。産まれた直後の記録は片手で打つことが多く、
 * 選択肢を出すぶんだけ手数が増える。押した性別でそのまま作る。
 * 間違えたときは、その子の編集画面から取り消せる。
 */
export function LitterActions({ litterId, damName }: { litterId: string; damName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<'♂' | '♀' | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [, startTransition] = useTransition();

  async function add(sex: '♂' | '♀') {
    setBusy(sex);
    setMsg('');
    setErr('');
    const res = await addPuppy(litterId, sex);
    setBusy(null);
    if (res.ok) {
      setMsg(res.message);
      startTransition(() => router.refresh());
    } else {
      setErr(res.message);
    }
  }

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <Btn on={busy === '♂'} disabled={busy !== null} onClick={() => add('♂')}>
          ＋ 男の子
        </Btn>
        <Btn on={busy === '♀'} disabled={busy !== null} onClick={() => add('♀')}>
          ＋ 女の子
        </Btn>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-adm-muted">
        {err ? (
          <span className="text-adm-danger">{err}</span>
        ) : msg ? (
          <span className="text-adm-action">{msg}</span>
        ) : (
          <>この腹に仔犬を足します（{damName}）。出産記録の頭数も一緒に直ります</>
        )}
      </p>
    </div>
  );
}

function Btn({
  children,
  on,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  on: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="tap flex-1 rounded-lg border border-adm-rule bg-adm-surface px-3 py-2 text-[13px] font-medium text-adm-action disabled:opacity-40"
    >
      {on ? '追加中…' : children}
    </button>
  );
}
