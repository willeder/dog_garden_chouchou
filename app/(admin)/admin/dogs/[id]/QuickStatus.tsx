'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Segment } from '@/app/(admin)/_components/Form';
import { setPupStatus } from './statusActions';

type S = '在舎' | '商談中' | '売約';

/**
 * 販売の状態をカルテから1タップで切り替える。
 * 以前は「編集 → 状態 → 保存」の3手順が必要だった。
 */
export function QuickStatus({ dogId, status }: { dogId: string; status: S }) {
  const router = useRouter();
  const [value, setValue] = useState<S>(status);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [, startTransition] = useTransition();

  async function change(v: S) {
    if (v === value || busy) return;
    const prev = value;
    setValue(v);
    setBusy(true);
    setErr('');
    const res = await setPupStatus(dogId, v);
    setBusy(false);
    if (!res.ok) {
      setValue(prev);
      setErr(res.message);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <Segment<S>
        value={value}
        onChange={change}
        label="販売の状態"
        options={[
          { value: '在舎', label: '在舎' },
          { value: '商談中', label: '商談中' },
          { value: '売約', label: '売約' },
        ]}
      />
      {err && <p className="mt-1.5 text-[12px] text-adm-danger">{err}</p>}
    </div>
  );
}
