'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DateField,
  FormSection,
  Notice,
  Row,
  SaveBar,
  SelectField,
  Segment,
  TextArea,
  TextField,
  Toggle,
} from '@/app/(admin)/_components/Form';
import { ColorDot } from '@/app/(admin)/_components/Marks';
import { ymdJp } from '@/app/_lib/admFormat';
import { saveDog } from './actions';
import {
  DOG_STATUSES,
  STATUS_HELP,
  normalizeChip,
  validateDog,
  type DogEditInput,
} from './shared';
import type { DogStatus } from '@/app/_model/admin';

export type Master = { code: string; name: string; hex?: string | null; hex2?: string | null };
export type PartnerOption = { id: string; name: string; license_no: string | null };

export function DogForm({
  dogId,
  breedName,
  initial,
  colors,
  coatTypes,
  ribbons,
  partners,
  canChangeSex,
  sexLockReason,
  footer,
}: {
  dogId: string;
  breedName: string;
  initial: DogEditInput;
  colors: Master[];
  coatTypes: Master[];
  ribbons: Master[];
  partners: PartnerOption[];
  canChangeSex: boolean;
  sexLockReason?: string;
  /** 保存バーの上に置く追加の操作（登録の取り消しなど） */
  footer?: React.ReactNode;
}) {
  const router = useRouter();
  const [f, setF] = useState<DogEditInput>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof DogEditInput>(k: K, v: DogEditInput[K]) => {
    setF((prev) => ({ ...prev, [k]: v }));
    setError('');
  };

  const dirty = JSON.stringify(f) !== JSON.stringify(initial);
  const chipDigits = normalizeChip(f.microchip);
  const selected = colors.find((c) => c.code === f.color_code);

  async function submit() {
    const bad = validateDog(f);
    if (bad) {
      setError(bad.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setBusy(true);
    const res = await saveDog(dogId, f);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // 保存できたら個体カードへ戻る。保存後に同じ画面に留まると
    // 「保存されたのか」が分からず二度押しになる
    router.push(`/admin/dogs/${dogId}`);
    router.refresh();
  }

  return (
    <>
      {error && <Notice kind="error">{error}</Notice>}

      <FormSection title="基本" note={breedName}>
        <Row label="名前" htmlFor="name" required>
          <TextField id="name" value={f.name} onChange={(v) => set('name', v)} maxLength={40} />
        </Row>

        <Row
          label="性別"
          hint={canChangeSex ? undefined : sexLockReason}
        >
          {canChangeSex ? (
            <Segment
              label="性別"
              value={f.sex}
              onChange={(v) => set('sex', v)}
              options={[
                { value: '♀', label: '♀ 女の子' },
                { value: '♂', label: '♂ 男の子' },
              ]}
            />
          ) : (
            <p className="num rounded-lg border border-adm-rule bg-adm-paper px-3 py-2 text-[15px] text-adm-muted">
              {f.sex}
            </p>
          )}
        </Row>

        <Row
          label="誕生日"
          htmlFor="birthday"
          hint={f.birthday ? <span className="font-bold text-adm-ink">{ymdJp(f.birthday)}</span> : undefined}
        >
          <DateField id="birthday" value={f.birthday} onChange={(v) => set('birthday', v)} />
        </Row>

        <Row label="毛色" htmlFor="color_code">
          <div className="flex items-center gap-2.5">
            <ColorDot hex={selected?.hex} hex2={selected?.hex2} label={selected?.name} size={34} />
            <span className="min-w-0 flex-1">
              <SelectField
                id="color_code"
                value={f.color_code}
                onChange={(v) => set('color_code', v)}
                empty="選ばない"
                options={colors.map((c) => ({ value: c.code, label: c.name }))}
              />
            </span>
          </div>
        </Row>

        <Row label="毛質" hint="チワワなど毛質を分ける犬種で使います">
          <Segment
            label="毛質"
            value={f.coat_type_code}
            onChange={(v) => set('coat_type_code', v)}
            options={[
              { value: '', label: '選ばない' },
              // 「スムースコート」は幅が足りず折り返すので短く出す
              ...coatTypes.map((t) => ({ value: t.code, label: t.name.replace('コート', '') })),
            ]}
          />
        </Row>

        <Row label="紐の色" hint="同じ腹の仔犬を見分けるための印です。一覧に出ます">
          <div className="flex flex-wrap gap-1.5">
            <RibbonChip
              on={f.ribbon_code === ''}
              onClick={() => set('ribbon_code', '')}
              label="なし"
            />
            {ribbons.map((r) => (
              <RibbonChip
                key={r.code}
                on={f.ribbon_code === r.code}
                onClick={() => set('ribbon_code', r.code)}
                label={r.name}
                hex={r.hex ?? undefined}
              />
            ))}
          </div>
        </Row>

        <Row label="体重" htmlFor="weight_kg" hint="kg。小数で入れられます（例 2.4）">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1">
              <TextField id="weight_kg" value={f.weight_kg} onChange={(v) => set('weight_kg', v)} numeric="decimal" placeholder="2.4" />
            </span>
            <span className="shrink-0 text-[14px] text-adm-muted">kg</span>
          </div>
        </Row>

        <Row
          label="マイクロチップ"
          htmlFor="microchip"
          hint={
            chipDigits
              ? `${chipDigits.length} / 15桁`
              : '15桁の数字。空白やハイフンが入っていても自動で外します'
          }
        >
          <TextField
            id="microchip"
            value={f.microchip}
            onChange={(v) => set('microchip', v)}
            numeric="numeric"
            maxLength={24}
            placeholder="392149002464984"
          />
        </Row>

        <Row label="遺伝子検査" htmlFor="genes" hint="複数あるときは「・」か「,」で区切ります（例 PRA・DM）">
          <TextField id="genes" value={f.genes} onChange={(v) => set('genes', v)} placeholder="PRA・DM" />
        </Row>
      </FormSection>

      <FormSection title="状態" help={STATUS_HELP[f.status]}>
        <Row label="いまの状態" htmlFor="status">
          <SelectField
            id="status"
            value={f.status}
            onChange={(v) => set('status', v as DogStatus)}
            options={DOG_STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </Row>

        {f.status === '死亡' && (
          <>
            <Row
              label="死亡した日"
              htmlFor="died_on"
              required
              hint={f.died_on ? <span className="font-bold text-adm-ink">{ymdJp(f.died_on)}</span> : '帳簿の項目です'}
            >
              <DateField id="died_on" value={f.died_on} onChange={(v) => set('died_on', v)} />
            </Row>
            <Row label="死因" htmlFor="death_cause">
              <TextField id="death_cause" value={f.death_cause} onChange={(v) => set('death_cause', v)} />
            </Row>
          </>
        )}
      </FormSection>

      <FormSection
        title="帳簿の項目"
        note="法令"
        help={
          <>
            <b className="text-adm-ink">動物愛護管理法の帳簿に必要な項目です。</b>
            自家繁殖の犬は所有日が誕生日になります。仕入れた犬は現行台帳に取得日の記録がないため、
            購入時の書類から入れてください。
          </>
        }
      >
        <Toggle
          id="is_self_bred"
          checked={f.is_self_bred}
          onChange={(v) => set('is_self_bred', v)}
          label="自家繁殖"
          note="この犬舎で産まれた"
        />

        {f.is_self_bred ? (
          <Row label="所有した日" hint="自家繁殖なので誕生日と同じになります">
            <p className="rounded-lg border border-adm-rule bg-adm-paper px-3 py-2 text-[15px] text-adm-muted">
              {f.birthday ? ymdJp(f.birthday) : '誕生日が未入力です'}
            </p>
          </Row>
        ) : (
          <>
            <Row label="繁殖者" htmlFor="breeder_id">
              <SelectField
                id="breeder_id"
                value={f.breeder_id}
                onChange={(v) => set('breeder_id', v)}
                empty="選ばない"
                options={partners.map((p) => ({
                  value: p.id,
                  label: p.license_no ? `${p.name}（${p.license_no}）` : p.name,
                }))}
              />
            </Row>
            <Row label="入手先" htmlFor="supplier_id" hint="繁殖者と同じ場合は同じものを選びます">
              <SelectField
                id="supplier_id"
                value={f.supplier_id}
                onChange={(v) => set('supplier_id', v)}
                empty="選ばない"
                options={partners.map((p) => ({
                  value: p.id,
                  label: p.license_no ? `${p.name}（${p.license_no}）` : p.name,
                }))}
              />
            </Row>
            <Row
              label="所有した日"
              htmlFor="acquired_on"
              hint={
                f.acquired_on ? (
                  <span className="font-bold text-adm-ink">{ymdJp(f.acquired_on)}</span>
                ) : (
                  'この犬を引き取った日'
                )
              }
            >
              <DateField id="acquired_on" value={f.acquired_on} onChange={(v) => set('acquired_on', v)} />
            </Row>
          </>
        )}
      </FormSection>

      <FormSection title="メモ" note="犬舎内だけに残ります">
        <Row label="メモ" htmlFor="note">
          <TextArea id="note" value={f.note} onChange={(v) => set('note', v)} rows={4} maxLength={2000} />
        </Row>
      </FormSection>

      {footer}

      <SaveBar busy={busy} onSave={submit} disabled={!dirty} label={dirty ? '保存する' : '変更はありません'} />
    </>
  );
}

function RibbonChip({
  on,
  onClick,
  label,
  hex,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  hex?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={`tap flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13.5px] ${
        on ? 'border-adm-action bg-adm-hint font-bold text-adm-action' : 'border-adm-rule bg-adm-surface text-adm-muted'
      }`}
    >
      {hex && (
        <span
          className="h-3.5 w-3.5 shrink-0 rounded-full border border-adm-rule"
          style={{ background: hex }}
          aria-hidden
        />
      )}
      {label}
    </button>
  );
}
