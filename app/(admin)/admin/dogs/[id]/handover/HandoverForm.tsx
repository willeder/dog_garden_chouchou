'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DateField,
  FormSection,
  Notice,
  Row,
  SaveBar,
  TextArea,
  TextField,
  Toggle,
} from '@/app/(admin)/_components/Form';
import { ymdJp } from '@/app/_lib/admFormat';
import { cancelHandover, saveHandover } from './actions';
import { validateHandover, type HandoverInput } from './shared';

/**
 * 引渡しの記録。帳簿（動物愛護管理法）の「販売・引渡し」の項目をここで入れる。
 * 保存すると状態が「引渡済」になり、公式サイトから外れる。
 */
export function HandoverForm({
  dogId,
  initial,
  isEdit,
  returnTo,
}: {
  dogId: string;
  returnTo?: string;
  initial: HandoverInput;
  isEdit: boolean;
}) {
  const router = useRouter();
  const [f, setF] = useState<HandoverInput>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [asking, setAsking] = useState(false);

  const set = <K extends keyof HandoverInput>(k: K, v: HandoverInput[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));

  const dirty = JSON.stringify(f) !== JSON.stringify(initial);

  async function submit() {
    const bad = validateHandover(f);
    if (bad) {
      setError(bad);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setBusy(true);
    setError('');
    const res = await saveHandover(dogId, f);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    router.push(returnTo ?? `/admin/dogs/${dogId}`);
    router.refresh();
  }

  async function cancel() {
    setBusy(true);
    setError('');
    const res = await cancelHandover(dogId);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      setAsking(false);
      return;
    }
    router.push(`/admin/dogs/${dogId}`);
    router.refresh();
  }

  return (
    <>
      {error && <Notice kind="error">{error}</Notice>}

      <FormSection
        title="引渡し"
        note="帳簿の項目"
        help={
          isEdit
            ? undefined
            : '保存すると状態が「引渡済」になり、公式サイトからは自動で外れます。'
        }
      >
        <Row
          label="引渡しの日"
          htmlFor="handover_date"
          required
          hint={f.handover_date ? <b className="text-adm-ink">{ymdJp(f.handover_date)}</b> : undefined}
        >
          <DateField id="handover_date" value={f.handover_date} onChange={(v) => set('handover_date', v)} />
        </Row>
        <Row label="価格（税込）" htmlFor="price" hint="円。空欄でも保存できます">
          <TextField id="price" value={f.price} onChange={(v) => set('price', v)} numeric="numeric" placeholder="250000" />
        </Row>
        <Row label="販売担当者名" htmlFor="staff_name" required hint="前回の記録の名前が入っています">
          <TextField id="staff_name" value={f.staff_name} onChange={(v) => set('staff_name', v)} maxLength={50} />
        </Row>
      </FormSection>

      <FormSection title="引渡し先" note="帳簿の項目">
        <Row label="お名前" htmlFor="customer_name" required>
          <TextField id="customer_name" value={f.customer_name} onChange={(v) => set('customer_name', v)} maxLength={100} />
        </Row>
        <Row label="電話番号" htmlFor="customer_phone">
          <TextField
            id="customer_phone"
            value={f.customer_phone}
            onChange={(v) => set('customer_phone', v)}
            numeric="numeric"
            maxLength={20}
          />
        </Row>
        <Row label="住所" htmlFor="customer_address">
          <TextField id="customer_address" value={f.customer_address} onChange={(v) => set('customer_address', v)} maxLength={200} />
        </Row>
      </FormSection>

      <FormSection
        title="説明と確認"
        note="法令"
        help="販売時は、お客様に対面で飼い方などを説明する必要があります（対面説明）。説明は引渡しの日かそれより前に行います。"
      >
        <Toggle
          id="explained_in_person"
          checked={f.explained_in_person}
          onChange={(v) => set('explained_in_person', v)}
          label="対面説明をした"
        />
        {f.explained_in_person && (
          <Row
            label="対面説明をした日"
            htmlFor="explained_on"
            required
            hint={f.explained_on ? <b className="text-adm-ink">{ymdJp(f.explained_on)}</b> : undefined}
          >
            <DateField id="explained_on" value={f.explained_on} onChange={(v) => set('explained_on', v)} />
          </Row>
        )}
        <Toggle
          id="compliance_checked"
          checked={f.compliance_checked}
          onChange={(v) => set('compliance_checked', v)}
          label="引渡し先の法令違反がないことを確認した"
          note="業者への引渡しのときに必要な確認です"
        />
      </FormSection>

      <FormSection title="メモ" note="犬舎内だけに残ります">
        <Row label="メモ" htmlFor="note">
          <TextArea id="note" value={f.note} onChange={(v) => set('note', v)} rows={3} maxLength={2000} />
        </Row>
      </FormSection>

      {isEdit && (
        <section className="px-4 pt-3.5">
          <h2 className="mb-2 text-[13px] font-bold tracking-wide">この引渡しの記録</h2>
          <div className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3">
            {asking ? (
              <>
                <p className="text-[13px] font-bold leading-relaxed">
                  引渡しの記録を取り消して、状態を「売約」に戻します。よろしいですか。
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={cancel}
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
                引渡しの記録を取り消す
              </button>
            )}
            <p className="mt-2.5 text-[11.5px] leading-relaxed text-adm-muted">
              間違えて記録したときに使います。日付や名前の打ち間違いは、上で直してください。
            </p>
          </div>
        </section>
      )}

      <SaveBar
        busy={busy}
        onSave={submit}
        disabled={isEdit && !dirty}
        label={isEdit ? (dirty ? '保存する' : '変更はありません') : '引渡しを記録する'}
      />
    </>
  );
}
