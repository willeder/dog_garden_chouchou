'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FormSection,
  Notice,
  Row,
  SaveBar,
  TextArea,
  TextField,
  Toggle,
} from '@/app/(admin)/_components/Form';
import { savePublish } from './actions';
import type { PublishInput } from './shared';

export type Check = {
  label: string;
  ok: boolean;
  /** false のあいだは公開できない */
  blocking: boolean;
  /** 直しに行く先 */
  fixHref?: string;
  fixLabel?: string;
  detail?: string;
};

export function PublishForm({
  dogId,
  dogName,
  initial,
  checks,
  publicPath,
}: {
  dogId: string;
  dogName: string;
  initial: PublishInput;
  checks: Check[];
  publicPath: string;
}) {
  const router = useRouter();
  const [f, setF] = useState<PublishInput>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof PublishInput>(k: K, v: PublishInput[K]) => {
    setF((prev) => ({ ...prev, [k]: v }));
    setError('');
  };

  const blockers = checks.filter((c) => c.blocking && !c.ok);
  const warnings = checks.filter((c) => !c.blocking && !c.ok);
  const canPublish = blockers.length === 0;
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);

  async function submit() {
    setBusy(true);
    const res = await savePublish(dogId, f);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    router.push(`/admin/dogs/${dogId}`);
    router.refresh();
  }

  return (
    <>
      {error && <Notice kind="error">{error}</Notice>}

      <FormSection
        title="サイトに出す"
        help={
          f.is_published
            ? '公開中です。サイトの「子犬紹介」に出ています。'
            : '出していません。切り替えて保存するとサイトに出ます。'
        }
      >
        <Toggle
          id="is_published"
          checked={f.is_published}
          onChange={(v) => set('is_published', v)}
          label="公式サイトに出す"
          note={
            canPublish
              ? `${dogName} を子犬紹介に載せます`
              : initial.is_published
                ? '足りないものがあります。直すか、公開を止めてください'
                : '下の「足りないもの」を先に直してください'
          }
          disabled={!canPublish && !f.is_published}
        />
      </FormSection>

      {blockers.length > 0 && (
        <FormSection title="足りないもの" note={`${blockers.length}件`}>
          {blockers.map((c) => (
            <CheckRow key={c.label} c={c} />
          ))}
        </FormSection>
      )}

      <FormSection
        title="価格と成犬時の目安"
        help="空欄のままでも公開できます。サイトでは空欄の項目は出ません。価格を空欄にすると「応相談」の扱いになります。"
      >
        <Row
          label="価格"
          htmlFor="list_price"
          // 桁を1つ間違えるのがいちばん怖い。読める形にして出す
          hint={priceLabel(f.list_price) ?? '税込の表示価格。空欄なら「応相談」'}
        >
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1">
              <TextField
                id="list_price"
                value={f.list_price}
                onChange={(v) => set('list_price', v)}
                numeric="numeric"
                placeholder="450000"
              />
            </span>
            <span className="shrink-0 text-[14px] text-adm-muted">円</span>
          </div>
        </Row>

        <Row label="成犬時の予想体重" htmlFor="expected_weight_kg" hint="kg。幅を持たせたいときはメッセージに書きます">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1">
              <TextField
                id="expected_weight_kg"
                value={f.expected_weight_kg}
                onChange={(v) => set('expected_weight_kg', v)}
                numeric="decimal"
                placeholder="3.0"
              />
            </span>
            <span className="shrink-0 text-[14px] text-adm-muted">kg</span>
          </div>
        </Row>

        <Row label="成犬時の予想体高" htmlFor="expected_height_cm">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1">
              <TextField
                id="expected_height_cm"
                value={f.expected_height_cm}
                onChange={(v) => set('expected_height_cm', v)}
                numeric="decimal"
                placeholder="25"
              />
            </span>
            <span className="shrink-0 text-[14px] text-adm-muted">cm</span>
          </div>
        </Row>
      </FormSection>

      <FormSection title="この子の紹介" note="サイトに出ます">
        <Row
          label="メッセージ"
          htmlFor="public_message"
          hint="性格やようすを2〜3行で。犬舎内のメモは編集画面の「メモ」に書いてください（そちらは出ません）"
        >
          <TextArea
            id="public_message"
            value={f.public_message}
            onChange={(v) => set('public_message', v)}
            rows={5}
            maxLength={600}
            placeholder="人が大好きで、呼ぶと走ってきます。兄妹の中では一番おっとりした性格です。"
          />
        </Row>
      </FormSection>

      {warnings.length > 0 && (
        <FormSection title="入れておくとよいもの" note={`${warnings.length}件`}>
          {warnings.map((c) => (
            <CheckRow key={c.label} c={c} />
          ))}
        </FormSection>
      )}

      {initial.is_published && (
        <p className="px-4 pt-3.5 text-[12.5px] leading-relaxed text-adm-muted">
          いま出ているページ：{' '}
          <Link href={publicPath} target="_blank" className="text-adm-action underline underline-offset-2">
            {publicPath}
          </Link>
        </p>
      )}

      <SaveBar
        busy={busy}
        onSave={submit}
        disabled={!dirty}
        label={dirty ? (f.is_published ? 'サイトに出して保存' : '保存する') : '変更はありません'}
      />
    </>
  );
}

/** 「450000」を「45万0000円」ではなく「450,000円」で見せる */
function priceLabel(v: string): string | null {
  const digits = v.replace(/[^\d]/g, '');
  if (!digits) return null;
  const n = Number(digits);
  if (!Number.isFinite(n)) return null;
  return `${n.toLocaleString('ja-JP')}円`;
}

function CheckRow({ c }: { c: Check }) {
  return (
    <div className="flex items-start gap-2.5 border-b border-adm-rule px-3.5 py-2.5 last:border-b-0">
      <span
        aria-hidden
        className={`mt-px shrink-0 text-[14px] font-bold ${c.blocking ? 'text-adm-danger' : 'text-adm-muted'}`}
      >
        {c.blocking ? '×' : '・'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px]">{c.label}</span>
        {c.detail && <span className="mt-0.5 block text-[11.5px] leading-relaxed text-adm-muted">{c.detail}</span>}
      </span>
      {c.fixHref && (
        <Link
          href={c.fixHref}
          className="tap flex shrink-0 items-center rounded-lg border border-adm-rule px-2.5 text-[12px] text-adm-action"
        >
          {c.fixLabel ?? '直す'}
        </Link>
      )}
    </div>
  );
}
