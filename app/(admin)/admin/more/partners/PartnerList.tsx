'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormSection, Notice, Row, TextArea, TextField } from '@/app/(admin)/_components/Form';
import { removePartner, savePartner } from './actions';
import { EMPTY_PARTNER, type PartnerInput, type PartnerListItem } from './shared';

/**
 * 相手先の一覧と編集。
 *
 * 件数が20件ほどで増え方も緩やかなので、画面を分けずに
 * 一覧の中で開いて直す形にしている。行き来が減るぶん速い。
 */
export function PartnerList({ items }: { items: PartnerListItem[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const done = () => {
    setOpenId(null);
    setAdding(false);
    router.refresh();
  };

  return (
    <>
      {adding ? (
        <PartnerForm
          title="相手先を追加"
          initial={EMPTY_PARTNER}
          onSaved={done}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <div className="px-4 pt-3.5">
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setOpenId(null);
            }}
            className="tap flex w-full items-center justify-center rounded-xl border border-adm-rule bg-adm-surface px-4 py-3 text-[14px] font-medium text-adm-action"
          >
            ＋ 相手先を追加
          </button>
        </div>
      )}

      <ul className="mx-4 mt-3.5 overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
        {items.length === 0 && (
          <li className="px-3.5 py-3 text-[12.5px] text-adm-muted">まだ登録がありません。</li>
        )}
        {items.map((p) => (
          <li key={p.id} className="border-b border-adm-rule last:border-b-0">
            <button
              type="button"
              onClick={() => {
                setOpenId(openId === p.id ? null : p.id);
                setAdding(false);
              }}
              className="tap flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left active:bg-adm-paper"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{p.name}</span>
                <span className="num block truncate text-[11.5px] text-adm-muted">
                  {[p.license_no ? `登録番号 ${p.license_no}` : '登録番号なし', p.contact_name, p.phone]
                    .filter(Boolean)
                    .join('　')}
                </span>
              </span>
              <span className="num shrink-0 text-[11.5px] text-adm-muted">
                {p.used > 0 ? `${p.used}頭` : '—'}
              </span>
            </button>

            {openId === p.id && (
              <div className="border-t border-adm-rule bg-adm-paper pb-2">
                <PartnerForm
                  title=""
                  id={p.id}
                  used={p.used}
                  initial={{
                    name: p.name,
                    contact_name: p.contact_name ?? '',
                    license_no: p.license_no ?? '',
                    phone: p.phone ?? '',
                    note: p.note ?? '',
                  }}
                  onSaved={done}
                  onCancel={() => setOpenId(null)}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mx-4 mt-3 rounded-xl border border-adm-rule bg-adm-hint px-3 py-2.5 text-[11.5px] leading-relaxed text-adm-muted">
        <b className="text-adm-ink">帳簿には「繁殖者の氏名」と「その登録番号」を書く必要があります。</b>
        登録番号はここに入れておくと、犬の編集画面で選ぶだけで帳簿に載ります。
        右端の数字は、その相手先が紐付いている犬の数です。
      </div>

      <div className="h-6" />
    </>
  );
}

function PartnerForm({
  title,
  id,
  used,
  initial,
  onSaved,
  onCancel,
}: {
  title: string;
  id?: string;
  used?: number;
  initial: PartnerInput;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState<PartnerInput>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [askRemove, setAskRemove] = useState(false);

  const set = <K extends keyof PartnerInput>(k: K, v: PartnerInput[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErr('');
  };

  async function save() {
    setBusy(true);
    const res = await savePartner(id ?? null, f);
    setBusy(false);
    if (!res.ok) {
      setErr(res.message);
      return;
    }
    onSaved();
  }

  async function remove() {
    if (!id) return;
    setBusy(true);
    const res = await removePartner(id);
    setBusy(false);
    if (!res.ok) {
      setErr(res.message);
      setAskRemove(false);
      return;
    }
    onSaved();
  }

  const uid = id ?? 'new';

  return (
    <>
      {err && <Notice kind="error">{err}</Notice>}

      <FormSection title={title || '内容'}>
        <Row label="名前" htmlFor={`p-name-${uid}`} required hint="犬舎名・店舗名・個人名">
          <TextField id={`p-name-${uid}`} value={f.name} onChange={(v) => set('name', v)} maxLength={80} />
        </Row>
        <Row label="登録番号" htmlFor={`p-lic-${uid}`} hint="第一種動物取扱業の登録番号。帳簿の項目です">
          <TextField id={`p-lic-${uid}`} value={f.license_no} onChange={(v) => set('license_no', v)} maxLength={60} />
        </Row>
        <Row label="担当者" htmlFor={`p-con-${uid}`}>
          <TextField id={`p-con-${uid}`} value={f.contact_name} onChange={(v) => set('contact_name', v)} maxLength={40} />
        </Row>
        <Row label="電話" htmlFor={`p-tel-${uid}`}>
          <TextField id={`p-tel-${uid}`} value={f.phone} onChange={(v) => set('phone', v)} numeric="numeric" maxLength={20} />
        </Row>
        <Row label="メモ" htmlFor={`p-note-${uid}`}>
          <TextArea id={`p-note-${uid}`} value={f.note} onChange={(v) => set('note', v)} rows={2} maxLength={500} />
        </Row>
      </FormSection>

      <div className="flex gap-2 px-4 pt-3">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="tap flex-1 rounded-xl bg-adm-action px-4 py-3 text-[14px] font-bold text-white disabled:opacity-40"
        >
          {busy ? '保存中…' : '保存する'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="tap flex-1 rounded-xl border border-adm-rule px-4 py-3 text-[14px] disabled:opacity-40"
        >
          やめる
        </button>
      </div>

      {id && (
        <div className="px-4 pt-2">
          {askRemove ? (
            <div className="rounded-xl border border-[#E3C9C7] bg-[#FBF3F2] px-3.5 py-3">
              <p className="text-[13px] font-bold">{f.name} を一覧から外しますか。</p>
              <div className="mt-2.5 flex gap-2">
                <button
                  type="button"
                  onClick={remove}
                  disabled={busy}
                  className="tap flex-1 rounded-xl bg-adm-danger px-4 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-40"
                >
                  外す
                </button>
                <button
                  type="button"
                  onClick={() => setAskRemove(false)}
                  disabled={busy}
                  className="tap flex-1 rounded-xl border border-adm-rule bg-adm-surface px-4 py-2.5 text-[13.5px] disabled:opacity-40"
                >
                  やめる
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAskRemove(true)}
              disabled={busy || (used ?? 0) > 0}
              className="tap w-full rounded-xl border border-[#E3C9C7] px-4 py-2.5 text-[13px] text-adm-danger disabled:border-adm-rule disabled:text-adm-muted disabled:opacity-60"
            >
              {(used ?? 0) > 0 ? `${used}頭に紐付いているため外せません` : '一覧から外す'}
            </button>
          )}
        </div>
      )}
    </>
  );
}
