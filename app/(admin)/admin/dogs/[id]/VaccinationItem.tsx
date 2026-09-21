'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DateField, Segment, TextField } from '@/app/(admin)/_components/Form';
import { ymd } from '@/app/_lib/admFormat';
import { deleteVaccination, updateVaccination } from './vaccinationActions';

/**
 * 接種記録1件。押すと直す・消すができる。
 * 以前は記録を足すことしかできず、打ち間違いを直せなかった。
 */
export function VaccinationItem({
  id,
  kind,
  dosedOn,
  note,
  kinds,
}: {
  id: string;
  kind: string;
  dosedOn: string;
  note: string | null;
  kinds: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [k, setK] = useState(kind);
  const [d, setD] = useState(dosedOn);
  const [n, setN] = useState(note ?? '');
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [, startTransition] = useTransition();

  const options = Array.from(new Set([...kinds, kind])).map((x) => ({ value: x, label: x }));
  const dirty = k !== kind || d !== dosedOn || n !== (note ?? '');

  function close() {
    setOpen(false);
    setAsking(false);
    setErr('');
    setK(kind);
    setD(dosedOn);
    setN(note ?? '');
  }

  async function save() {
    setBusy(true);
    setErr('');
    const res = await updateVaccination(id, { kind: k, dosed_on: d, note: n });
    setBusy(false);
    if (!res.ok) return setErr(res.message);
    setOpen(false);
    startTransition(() => router.refresh());
  }

  async function remove() {
    setBusy(true);
    setErr('');
    const res = await deleteVaccination(id);
    setBusy(false);
    if (!res.ok) {
      setAsking(false);
      return setErr(res.message);
    }
    startTransition(() => router.refresh());
  }

  if (!open) {
    return (
      <li className="border-b border-adm-rule last:border-b-0">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="tap flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left active:bg-adm-paper"
        >
          <span className="min-w-0">
            <span className="block text-[13px]">{kind}</span>
            {note && <span className="block truncate text-[11px] text-adm-muted">{note}</span>}
          </span>
          <span className="num shrink-0 text-[13px]">
            {ymd(dosedOn)}
            <span className="ml-2 text-[11.5px] text-adm-action">直す</span>
          </span>
        </button>
      </li>
    );
  }

  return (
    <li className="border-b border-adm-rule bg-adm-paper px-3.5 py-3 last:border-b-0">
      <div className="space-y-2">
        <Segment value={k} onChange={setK} options={options} label="種類" />
        <DateField id={`dosed-${id}`} value={d} onChange={setD} />
        <TextField id={`note-${id}`} value={n} onChange={setN} placeholder="メモ（任意）" maxLength={200} />
      </div>
      {err && <p className="mt-2 text-[12px] text-adm-danger">{err}</p>}

      {asking ? (
        <div className="mt-3">
          <p className="text-[12.5px] font-bold">
            {kind} {ymd(dosedOn)} の記録を削除します。よろしいですか。
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="tap flex-1 rounded-xl bg-adm-danger px-4 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-40"
            >
              {busy ? '処理中…' : '削除する'}
            </button>
            <button
              type="button"
              onClick={() => setAsking(false)}
              disabled={busy}
              className="tap flex-1 rounded-xl border border-adm-rule bg-adm-surface px-4 py-2.5 text-[13.5px] disabled:opacity-40"
            >
              やめる
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={save}
            disabled={busy || !dirty}
            className="tap flex-1 rounded-xl bg-adm-action px-4 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-40"
          >
            {busy ? '保存中…' : '保存する'}
          </button>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="tap rounded-xl border border-adm-rule bg-adm-surface px-4 py-2.5 text-[13.5px] disabled:opacity-40"
          >
            閉じる
          </button>
          <button
            type="button"
            onClick={() => setAsking(true)}
            disabled={busy}
            className="tap rounded-xl border border-[#E3C9C7] bg-adm-surface px-3 py-2.5 text-[13px] text-adm-danger disabled:opacity-40"
          >
            削除
          </button>
        </div>
      )}
    </li>
  );
}
