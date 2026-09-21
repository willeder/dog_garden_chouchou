'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Notice, SaveBar, SelectField, TextField } from '@/app/(admin)/_components/Form';
import { saveLitterPups, type PupEdit } from './actions';

export type Opt = { code: string; name: string };

/**
 * 同じ腹の仔犬をまとめて入力する。
 * 仮の名前（「クッキー ④ ♀1」）のままの子に名前・チップを付けていく作業を、
 * 1頭ずつ画面を開かずに済ませる。
 */
export function PupsForm({
  litterId,
  rows,
  colors,
  ribbons,
  returnTo,
}: {
  litterId: string;
  rows: { sex: string; status: string; edit: PupEdit }[];
  colors: Opt[];
  ribbons: Opt[];
  returnTo: string;
}) {
  const router = useRouter();
  const initial = rows.map((r) => r.edit);
  const [list, setList] = useState<PupEdit[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [badId, setBadId] = useState<string | null>(null);

  const set = (i: number, k: keyof PupEdit, v: string) =>
    setList((prev) => prev.map((p, j) => (j === i ? { ...p, [k]: v } : p)));

  const changed = list.filter((p, i) => JSON.stringify(p) !== JSON.stringify(initial[i]));

  async function submit() {
    setBusy(true);
    setError('');
    setBadId(null);
    const res = await saveLitterPups(litterId, changed);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      setBadId(res.dogId ?? null);
      if (res.dogId) document.getElementById(`pup-${res.dogId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    router.push(returnTo);
    router.refresh();
  }

  return (
    <>
      {error && <Notice kind="error">{error}</Notice>}

      {list.map((p, i) => {
        const meta = rows[i];
        return (
          <section key={p.id} id={`pup-${p.id}`} className="scroll-mt-20 px-4 pt-3.5">
            <div
              className={`overflow-hidden rounded-xl border bg-adm-surface ${
                badId === p.id ? 'border-adm-danger' : 'border-adm-rule'
              }`}
            >
              <div className="flex items-center justify-between border-b border-adm-rule px-3.5 py-2">
                <span className="num text-[13px] font-bold">
                  {i + 1}頭目　{meta.sex}
                </span>
                <span className="text-[11.5px] text-adm-muted">{meta.status}</span>
              </div>
              <div className="space-y-2 px-3.5 py-2.5">
                <label className="block text-[12px] font-medium text-adm-muted" htmlFor={`name-${p.id}`}>
                  名前
                </label>
                <TextField id={`name-${p.id}`} value={p.name} onChange={(v) => set(i, 'name', v)} maxLength={40} />
                <label className="block text-[12px] font-medium text-adm-muted" htmlFor={`chip-${p.id}`}>
                  マイクロチップ（15桁）
                </label>
                <TextField
                  id={`chip-${p.id}`}
                  value={p.microchip}
                  onChange={(v) => set(i, 'microchip', v)}
                  numeric="numeric"
                  maxLength={20}
                  placeholder="392…"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[12px] font-medium text-adm-muted" htmlFor={`color-${p.id}`}>
                      毛色
                    </label>
                    <div className="mt-1">
                      <SelectField
                        id={`color-${p.id}`}
                        value={p.color_code}
                        onChange={(v) => set(i, 'color_code', v)}
                        options={colors.map((c) => ({ value: c.code, label: c.name }))}
                        empty="未選択"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-adm-muted" htmlFor={`ribbon-${p.id}`}>
                      紐の色
                    </label>
                    <div className="mt-1">
                      <SelectField
                        id={`ribbon-${p.id}`}
                        value={p.ribbon_code}
                        onChange={(v) => set(i, 'ribbon_code', v)}
                        options={ribbons.map((c) => ({ value: c.code, label: c.name }))}
                        empty="未選択"
                      />
                    </div>
                  </div>
                </div>
                <label className="block text-[12px] font-medium text-adm-muted" htmlFor={`w-${p.id}`}>
                  体重（kg）
                </label>
                <TextField
                  id={`w-${p.id}`}
                  value={p.weight_kg}
                  onChange={(v) => set(i, 'weight_kg', v)}
                  numeric="decimal"
                  maxLength={6}
                  placeholder="1.2"
                />
              </div>
            </div>
          </section>
        );
      })}

      <SaveBar
        busy={busy}
        onSave={submit}
        disabled={changed.length === 0}
        label={changed.length > 0 ? `${changed.length}頭分を保存する` : '変更はありません'}
      />
    </>
  );
}
