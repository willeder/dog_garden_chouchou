'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormSection, Row, TextArea, TextField } from '@/app/(admin)/_components/Form';
import { saveBreedExplanation, saveVaccineInterval } from './actions';

export type VaccineRow = { kind: string; interval_months: number; note: string | null };
export type BreedRow = { code: string; name: string; hex: string; explanation: string | null };

/** ワクチンの間隔。保存すると次回予定日とホームのアラートが計算し直される */
export function VaccineSettings({ rows }: { rows: VaccineRow[] }) {
  const router = useRouter();
  const [vals, setVals] = useState<Record<string, string>>(
    Object.fromEntries(rows.map((r) => [r.kind, String(r.interval_months)])),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function save(kind: string) {
    setBusy(kind);
    setMsg('');
    setErr('');
    const res = await saveVaccineInterval(kind, Number(vals[kind]));
    setBusy(null);
    if (res.ok) {
      setMsg(res.message);
      router.refresh();
    } else {
      setErr(res.message);
    }
  }

  return (
    <FormSection
      title="ワクチンの間隔"
      help="前回の接種日にこの月数を足したものが、次回の予定日になります。ホームのアラートもこの計算で出ます。"
    >
      {rows.map((r) => {
        const changed = vals[r.kind] !== String(r.interval_months);
        return (
          <Row
            key={r.kind}
            label={r.kind}
            htmlFor={`v-${r.kind}`}
            hint={err && busy === null ? <span className="text-adm-danger">{err}</span> : msg || r.note || undefined}
          >
            <div className="flex items-center gap-2">
              <span className="w-20 shrink-0">
                <TextField
                  id={`v-${r.kind}`}
                  value={vals[r.kind] ?? ''}
                  onChange={(v) => setVals((p) => ({ ...p, [r.kind]: v.replace(/[^\d]/g, '') }))}
                  numeric="numeric"
                  maxLength={2}
                />
              </span>
              <span className="shrink-0 text-[14px] text-adm-muted">ヶ月ごと</span>
              <button
                type="button"
                onClick={() => save(r.kind)}
                disabled={!changed || busy !== null}
                className="tap ml-auto shrink-0 rounded-lg border border-adm-rule px-3 text-[13px] font-medium text-adm-action disabled:text-adm-muted disabled:opacity-50"
              >
                {busy === r.kind ? '保存中…' : '保存'}
              </button>
            </div>
          </Row>
        );
      })}
    </FormSection>
  );
}

/** 犬種の説明。公式サイトの子犬詳細「犬種」欄に出る */
export function BreedSettings({ rows }: { rows: BreedRow[] }) {
  const router = useRouter();
  const [vals, setVals] = useState<Record<string, string>>(
    Object.fromEntries(rows.map((r) => [r.code, r.explanation ?? ''])),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function save(code: string) {
    setBusy(code);
    setMsg('');
    setErr('');
    const res = await saveBreedExplanation(code, vals[code] ?? '');
    setBusy(null);
    if (res.ok) {
      setMsg(res.message);
      router.refresh();
    } else {
      setErr(res.message);
    }
  }

  return (
    <FormSection
      title="犬種の説明"
      note="サイトに出ます"
      help={
        <>
          公式サイトの子犬ページで、犬種名の下に小さく出ます。<b className="text-adm-ink">犬種ごとに1つ</b>で、
          その犬種の子犬すべてに共通です。1頭ごとの紹介文は、その子の「サイト公開の設定」に入れてください。
        </>
      }
    >
      {rows.map((r) => {
        const changed = (vals[r.code] ?? '') !== (r.explanation ?? '');
        const len = (vals[r.code] ?? '').length;
        return (
          <Row
            key={r.code}
            label={r.name}
            htmlFor={`b-${r.code}`}
            hint={
              err && busy === null ? (
                <span className="text-adm-danger">{err}</span>
              ) : (
                <span className={len > 200 ? 'text-adm-danger' : undefined}>
                  {len} / 200文字　{msg}
                </span>
              )
            }
          >
            <TextArea
              id={`b-${r.code}`}
              value={vals[r.code] ?? ''}
              onChange={(v) => setVals((p) => ({ ...p, [r.code]: v }))}
              // 200文字を折り返しても隠れない高さ。中を上下に動かさずに全文が見える
              rows={5}
              maxLength={200}
            />
            <button
              type="button"
              onClick={() => save(r.code)}
              disabled={!changed || busy !== null}
              className="tap mt-1.5 w-full rounded-lg border border-adm-rule px-3 py-2 text-[13px] font-medium text-adm-action disabled:text-adm-muted disabled:opacity-50"
            >
              {busy === r.code ? '保存中…' : changed ? '保存' : '変更はありません'}
            </button>
          </Row>
        );
      })}
    </FormSection>
  );
}
