'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ymd, todayJst } from '@/app/_lib/admFormat';
import { Stepper } from '@/app/(admin)/_components/Form';
import type { DeliveryMethod } from '@/app/_model/admin';
import { saveLitter, createPuppies, undoLitter } from './actions';

export type DamOption = {
  id: string;
  name: string;
  breed_code: string;
  breed_name: string;
  breed_hex: string;
  last_birth_date: string | null;
  litter_count: number;
};

export type SireOption = {
  id: string;
  name: string;
  breed_code: string;
  breed_name: string;
  is_external: boolean;
  status: string;
};

const METHODS: DeliveryMethod[] = ['自然', '帝王切開', '後帝'];

/** 妊娠日数の目安。外れても保存はブロックしない（実際に外れた記録が台帳にある） */
const GEST_MIN = 50;
const GEST_MAX = 75;
const GEST_DEFAULT = 60;

export function LitterForm({
  dams,
  sires,
  initialDamId,
}: {
  dams: DamOption[];
  sires: SireOption[];
  initialDamId?: string;
}) {
  const router = useRouter();

  const [damId, setDamId] = useState(initialDamId ?? '');
  const [damQuery, setDamQuery] = useState('');
  const [sireId, setSireId] = useState('');
  const [sireQuery, setSireQuery] = useState('');
  const [birthDate, setBirthDate] = useState(todayJst());
  const [gest, setGest] = useState<number | null>(GEST_DEFAULT);
  const [method, setMethod] = useState<DeliveryMethod | null>('自然');
  const [male, setMale] = useState(0);
  const [female, setFemale] = useState(0);
  const [still, setStill] = useState(0);
  const [note, setNote] = useState('');

  const [state, setState] = useState<'edit' | 'saving' | 'saved'>('edit');
  const [error, setError] = useState('');
  const [dupWarn, setDupWarn] = useState(false);
  const [dupLitterId, setDupLitterId] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ litterId: string; pupCount: number } | null>(null);
  const [pupsMade, setPupsMade] = useState<number | null>(null);

  const dam = dams.find((d) => d.id === damId);

  const damMatches = useMemo(() => {
    const q = damQuery.trim();
    if (!q) return dams.slice(0, 12);
    return dams.filter((d) => d.name.includes(q) || d.breed_code.includes(q.toUpperCase()));
  }, [damQuery, dams]);

  // 父の候補は母と同じ犬種を先に出す。ミックスもあるので他犬種も残す。
  const sireMatches = useMemo(() => {
    const q = sireQuery.trim();
    const base = q
      ? sires.filter((s) => s.name.includes(q) || s.breed_code.includes(q.toUpperCase()))
      : sires;
    if (!dam) return base.slice(0, 14);
    return [...base].sort((a, b) => {
      const am = a.breed_code === dam.breed_code ? 0 : 1;
      const bm = b.breed_code === dam.breed_code ? 0 : 1;
      return am - bm || a.name.localeCompare(b.name, 'ja');
    }).slice(0, 14);
  }, [sireQuery, sires, dam]);

  const sire = sires.find((s) => s.id === sireId);
  const gestOut = gest !== null && (gest < GEST_MIN || gest > GEST_MAX);
  const isMix = dam && sire ? dam.breed_code !== sire.breed_code : null;

  async function submit(allowDuplicate = false) {
    setState('saving');
    setError('');
    const res = await saveLitter({
      damId,
      sireId: sireId || null,
      birthDate,
      gestationDays: gest,
      method,
      male,
      female,
      stillborn: still,
      note,
      allowDuplicate,
    });
    if (!res.ok) {
      setError(res.message);
      setDupWarn(Boolean(res.duplicate));
      setDupLitterId(res.existingLitterId ?? null);
      setState('edit');
      return;
    }
    setSaved({ litterId: res.litterId, pupCount: res.pupCount });
    setState('saved');
  }

  async function makePuppies() {
    if (!saved) return;
    setState('saving');
    const res = await createPuppies(saved.litterId);
    setState('saved');
    if (!res.ok) setError(res.message);
    else setPupsMade(res.pupCount);
  }

  async function undo() {
    if (!saved) return;
    setState('saving');
    const res = await undoLitter(saved.litterId);
    if (!res.ok) {
      setError(res.message);
      setState('saved');
      return;
    }
    // 入力内容はそのまま残す。打ち直させない。
    setSaved(null);
    setPupsMade(null);
    setState('edit');
  }

  /* ───────── 保存後 ───────── */
  if (state !== 'edit' && saved) {
    return (
      <div className="px-4 pt-4">
        <div className="rounded-xl border border-adm-rule bg-adm-surface p-4">
          <p className="text-[16px] font-bold">保存しました</p>
          <p className="num mt-1.5 text-[13px] text-adm-muted">
            {dam?.name}　{ymd(birthDate)}　♂{male} ♀{female}
            {still > 0 && ` 死産${still}`}
          </p>

          {pupsMade === null ? (
            saved.pupCount > 0 ? (
              <>
                <p className="mt-3.5 text-[13.5px] leading-relaxed">
                  産まれた仔犬 <span className="num font-bold">{saved.pupCount}頭</span> を
                  台帳に登録しますか。
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-adm-muted">
                  仮の名前で作ります。誕生日・父母・犬種・所有日は自動で入ります。
                  名前はあとから変えられます。
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={makePuppies}
                    disabled={state === 'saving'}
                    className="tap flex-1 rounded-xl bg-adm-action px-4 py-3 text-[14px] font-bold text-white disabled:opacity-40"
                  >
                    {state === 'saving' ? '処理中…' : '登録する'}
                  </button>
                  <button
                    onClick={() => setPupsMade(0)}
                    disabled={state === 'saving'}
                    className="tap flex-1 rounded-xl border border-adm-rule px-4 py-3 text-[14px] disabled:opacity-40"
                  >
                    あとで
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-3 text-[12.5px] text-adm-muted">生存頭数が0なので仔犬の登録はありません。</p>
            )
          ) : (
            <p className="num mt-3.5 text-[13.5px] text-adm-action">
              {pupsMade > 0 ? `仔犬 ${pupsMade}頭 を登録しました` : '仔犬の登録は保留にしました'}
            </p>
          )}

          {error && <p className="mt-3 text-[12.5px] text-adm-danger">{error}</p>}

          <div className="mt-4 flex flex-col gap-2 border-t border-adm-rule pt-3.5">
            <Link
              href={`/admin/dogs/${damId}?t=${encodeURIComponent('出産')}`}
              className="tap flex items-center justify-center rounded-xl border border-adm-rule px-4 py-2.5 text-[13.5px]"
            >
              {dam?.name} のカルテで確認
            </Link>
            <button
              onClick={() => {
                setSaved(null);
                setPupsMade(null);
                setMale(0);
                setFemale(0);
                setStill(0);
                setNote('');
                setState('edit');
                router.refresh();
              }}
              className="tap rounded-xl border border-adm-rule px-4 py-2.5 text-[13.5px]"
            >
              続けて別の出産を記録
            </button>
            <button
              onClick={undo}
              disabled={state === 'saving'}
              className="tap text-[12.5px] text-adm-danger underline underline-offset-4 disabled:opacity-40"
            >
              この登録を取り消す
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────── 入力 ───────── */
  return (
    <div className="px-4 pb-28 pt-3">
      {/* 母犬 */}
      <Field label="母犬" required>
        {dam ? (
          <button
            onClick={() => setDamId('')}
            className="tap flex w-full items-center gap-2.5 rounded-xl border border-adm-action bg-adm-surface px-3.5 py-2.5 text-left"
          >
            <span className="w-1 self-stretch rounded-full" style={{ background: dam.breed_hex }} />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium">{dam.name}</span>
              <span className="num block text-[11.5px] text-adm-muted">
                {dam.breed_name}　{dam.litter_count > 0 ? `${dam.litter_count}回目まで記録あり` : '初産'}
              </span>
            </span>
            <span className="text-[12px] text-adm-action">変える</span>
          </button>
        ) : (
          <>
            <input
              type="search"
              value={damQuery}
              onChange={(e) => setDamQuery(e.target.value)}
              placeholder="名前で絞り込む"
              className="tap w-full rounded-xl border border-adm-rule bg-adm-surface px-3.5 text-[16px] outline-none focus:border-adm-action"
            />
            <ul className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-adm-rule bg-adm-surface">
              {damMatches.length === 0 && (
                <li className="px-3.5 py-3 text-[12.5px] text-adm-muted">該当する母犬がいません</li>
              )}
              {damMatches.map((d) => (
                <li key={d.id} className="border-b border-adm-rule last:border-b-0">
                  <button
                    onClick={() => {
                      setDamId(d.id);
                      setDamQuery('');
                    }}
                    className="tap flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left active:bg-adm-paper"
                  >
                    <span className="w-1 self-stretch rounded-full" style={{ background: d.breed_hex }} />
                    <span className="min-w-0 flex-1 text-[14.5px]">{d.name}</span>
                    <span className="num shrink-0 text-[11.5px] text-adm-muted">
                      {d.last_birth_date ? ymd(d.last_birth_date) : '初産'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Field>

      {/* 出産日 */}
      <Field label="出産日" required>
        <input
          type="date"
          value={birthDate}
          max={todayJst()}
          onChange={(e) => setBirthDate(e.target.value)}
          className="num tap w-full rounded-xl border border-adm-rule bg-adm-surface px-3.5 text-[16px] outline-none focus:border-adm-action"
        />
      </Field>

      {/* 父 */}
      <Field label="父">
        {sire ? (
          <button
            onClick={() => setSireId('')}
            className="tap flex w-full items-center gap-2 rounded-xl border border-adm-action bg-adm-surface px-3.5 py-2.5 text-left"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium">
                {sire.name}
                {sire.is_external && <Tag>外交配</Tag>}
                {isMix && <Tag>ミックス</Tag>}
              </span>
              <span className="block text-[11.5px] text-adm-muted">{sire.breed_name}</span>
            </span>
            <span className="text-[12px] text-adm-action">変える</span>
          </button>
        ) : (
          <>
            <input
              type="search"
              value={sireQuery}
              onChange={(e) => setSireQuery(e.target.value)}
              placeholder="名前で絞り込む"
              className="tap w-full rounded-xl border border-adm-rule bg-adm-surface px-3.5 text-[16px] outline-none focus:border-adm-action"
            />
            <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-adm-rule bg-adm-surface">
              {sireMatches.map((s) => (
                <li key={s.id} className="border-b border-adm-rule last:border-b-0">
                  <button
                    onClick={() => {
                      setSireId(s.id);
                      setSireQuery('');
                    }}
                    className="tap flex w-full items-center gap-2 px-3.5 py-2.5 text-left active:bg-adm-paper"
                  >
                    <span className="min-w-0 flex-1 text-[14.5px]">
                      {s.name}
                      {s.is_external && <Tag>外交配</Tag>}
                      {s.status === '退役' && <Tag>退役</Tag>}
                    </span>
                    <span className="shrink-0 text-[11.5px] text-adm-muted">{s.breed_name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-adm-muted">
              一覧から選びます。手入力にすると、いまの台帳と同じ表記のばらつきが起きます。
              分からない場合は空のままで保存できます。
            </p>
          </>
        )}
      </Field>

      {/* 妊娠日数 */}
      <Field label="妊娠日数">
        <Stepper
          value={gest ?? 0}
          onChange={(v) => setGest(v)}
          min={40}
          max={90}
          suffix="日"
          allowNull
          isNull={gest === null}
          onNull={() => setGest(null)}
        />
        {gestOut && (
          <p className="mt-1.5 text-[12px] text-adm-danger">
            {GEST_MIN}〜{GEST_MAX}日の範囲から外れています。このまま保存もできます。
          </p>
        )}
      </Field>

      {/* 分娩方法 */}
      <Field label="分娩方法">
        <div className="grid grid-cols-3 gap-1.5">
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`tap rounded-xl border px-2 text-[13.5px] ${
                method === m
                  ? 'border-adm-action bg-adm-action font-bold text-white'
                  : 'border-adm-rule bg-adm-surface text-adm-ink'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </Field>

      {/* 頭数 */}
      <Field label="産まれた数">
        <div className="flex flex-col gap-2">
          <Stepper value={male} onChange={setMale} min={0} max={20} prefix="♂" />
          <Stepper value={female} onChange={setFemale} min={0} max={20} prefix="♀" />
          <Stepper value={still} onChange={setStill} min={0} max={20} prefix="死産" danger />
        </div>
        <p className="num mt-1.5 text-[12px] text-adm-muted">
          生存 {male + female}頭{still > 0 && `　死産 ${still}頭`}
        </p>
      </Field>

      {/* 備考 */}
      <Field label="備考">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="剥離、次回は帝王切開 など"
          className="w-full rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-adm-action"
        />
      </Field>

      {error && (
        <div className="mt-3 rounded-xl border border-adm-rule bg-adm-surface p-3.5">
          <p className="text-[13px] text-adm-danger">{error}</p>
          {dupWarn && dupLitterId && (
            <Link
              href={`/admin/litters/${dupLitterId}/edit`}
              className="tap mt-2.5 flex w-full items-center justify-center rounded-xl border border-adm-rule px-4 py-2.5 text-[13px] text-adm-action"
            >
              すでにある記録を直す
            </Link>
          )}
          {dupWarn && (
            <button
              onClick={() => submit(true)}
              className="tap mt-2.5 w-full rounded-xl border border-adm-danger px-4 py-2.5 text-[13px] text-adm-danger"
            >
              同じ日に2回の出産として保存する
            </button>
          )}
        </div>
      )}

      {/* 保存ボタンは親指が届く下部に固定する */}
      <div className="fixed inset-x-0 bottom-[58px] z-20 mx-auto max-w-2xl border-t border-adm-rule bg-adm-surface px-4 py-3">
        <button
          onClick={() => submit(false)}
          disabled={state === 'saving' || !damId}
          className="tap w-full rounded-xl bg-adm-action px-4 py-3.5 text-[15px] font-bold text-white disabled:opacity-40"
        >
          {state === 'saving' ? '保存中…' : !damId ? '母犬を選んでください' : '保存'}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-3.5 first:pt-0">
      <p className="mb-1.5 text-[12.5px] text-adm-muted">
        {label}
        {required && <span className="ml-1 text-adm-danger">必須</span>}
      </p>
      {children}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1.5 rounded border border-adm-rule bg-adm-paper px-1.5 py-px text-[10.5px] font-normal text-adm-muted">
      {children}
    </span>
  );
}
