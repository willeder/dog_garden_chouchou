'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DateField,
  FormSection,
  Notice,
  Row,
  SaveBar,
  Stepper,
  TextArea,
} from '@/app/(admin)/_components/Form';
import { ymd, ymdJp, todayJst } from '@/app/_lib/admFormat';
import { saveLitterEdit } from './actions';
import {
  COUNT_MAX,
  DELIVERY_METHODS,
  GEST_MAX,
  GEST_MIN,
  validateLitter,
  type LitterEditInput,
} from './shared';

export type SireOption = {
  id: string;
  name: string;
  breed_code: string;
  breed_name: string;
  is_external: boolean;
  status: string;
};

export type PupRow = {
  id: string;
  name: string;
  sex: string;
  birthday: string | null;
};

export function LitterEditForm({
  litterId,
  damId,
  damName,
  damBreedCode,
  initial,
  sires,
  pups,
  footer,
}: {
  litterId: string;
  damId: string;
  damName: string;
  damBreedCode: string;
  initial: LitterEditInput;
  sires: SireOption[];
  pups: PupRow[];
  /** 保存バーの上に置く追加の操作（記録の取り消しなど） */
  footer?: React.ReactNode;
}) {
  const router = useRouter();
  const [f, setF] = useState<LitterEditInput>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [conflictId, setConflictId] = useState<string | null>(null);
  const [pickSire, setPickSire] = useState(false);
  const [sireQuery, setSireQuery] = useState('');

  const set = <K extends keyof LitterEditInput>(k: K, v: LitterEditInput[K]) => {
    setF((prev) => ({ ...prev, [k]: v }));
    setError('');
    setConflictId(null);
  };

  const dirty = JSON.stringify(f) !== JSON.stringify(initial);
  const sire = sires.find((s) => s.id === f.sireId);
  const isMix = f.sireId && sire ? sire.breed_code !== damBreedCode : null;

  // 仔犬を登録済みなら頭数はここで動かさない。
  // 動かせてしまうと、カルテの「♂2 ♀1」と実際にいる仔犬の数が食い違う。
  const hasPups = pups.length > 0;

  // 出産日を直したとき、一緒に誕生日が動く仔犬。
  // 個体ごとに誕生日を直した子（日をまたいで生まれた子など）は動かさない。
  const followers = useMemo(
    () => pups.filter((p) => p.birthday === initial.birthDate),
    [pups, initial.birthDate],
  );
  const strays = pups.length - followers.length;
  const dateChanged = f.birthDate !== initial.birthDate;

  const sireMatches = useMemo(() => {
    const q = sireQuery.trim();
    const base = q
      ? sires.filter((s) => s.name.includes(q) || s.breed_code.includes(q.toUpperCase()))
      : sires;
    return [...base]
      .sort((a, b) => {
        const am = a.breed_code === damBreedCode ? 0 : 1;
        const bm = b.breed_code === damBreedCode ? 0 : 1;
        return am - bm || a.name.localeCompare(b.name, 'ja');
      })
      .slice(0, 14);
  }, [sireQuery, sires, damBreedCode]);

  async function submit() {
    const bad = validateLitter(f, todayJst());
    if (bad) {
      setError(bad.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setBusy(true);
    const res = await saveLitterEdit(litterId, f);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      setConflictId(res.conflictLitterId ?? null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // 保存できたら母犬のカルテの出産タブへ戻る。
    // 同じ画面に留まると「保存されたのか」が分からず二度押しになる。
    router.push(`/admin/dogs/${damId}?t=${encodeURIComponent('出産')}`);
    router.refresh();
  }

  return (
    <>
      {error && (
        <Notice kind="error">
          {error}
          {conflictId && (
            <>
              {' '}
              <Link
                href={`/admin/litters/${conflictId}/edit`}
                className="underline underline-offset-2"
              >
                その記録を開く
              </Link>
            </>
          )}
        </Notice>
      )}

      <FormSection
        title="出産"
        note={damName}
        help={
          <>
            母犬は変えられません。母を間違えて登録した場合は、この記録を取り消して
            正しい母犬で入れ直してください。
          </>
        }
      >
        <Row label="母犬">
          <p className="text-[15px] font-medium">{damName}</p>
        </Row>

        <Row
          label="出産日"
          htmlFor="birth_date"
          required
          hint={
            f.birthDate ? (
              <span className="font-bold text-adm-ink">{ymdJp(f.birthDate)}</span>
            ) : undefined
          }
        >
          <DateField id="birth_date" value={f.birthDate} onChange={(v) => set('birthDate', v)} />
        </Row>

        <Row label="父" hint={sire?.is_external ? '外交配の父です' : undefined}>
          {!pickSire ? (
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 text-[15px]">
                {sire ? (
                  <>
                    {sire.name}
                    <span className="ml-1.5 text-[11.5px] text-adm-muted">{sire.breed_name}</span>
                    {isMix && <Tag>ミックス</Tag>}
                  </>
                ) : (
                  <span className="text-adm-muted">未登録</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setPickSire(true)}
                className="tap shrink-0 rounded-lg border border-adm-rule px-3 py-2 text-[12.5px] text-adm-action"
              >
                変える
              </button>
            </div>
          ) : (
            <>
              <input
                type="search"
                value={sireQuery}
                onChange={(e) => setSireQuery(e.target.value)}
                placeholder="名前で絞り込む"
                className="tap w-full rounded-lg border border-adm-rule bg-adm-surface px-3 py-2 text-[16px] outline-none focus:border-adm-action"
              />
              <ul className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-adm-rule">
                <li className="border-b border-adm-rule">
                  <button
                    type="button"
                    onClick={() => {
                      set('sireId', '');
                      setPickSire(false);
                      setSireQuery('');
                    }}
                    className="tap w-full px-3 py-2.5 text-left text-[14px] text-adm-muted active:bg-adm-paper"
                  >
                    父は未登録にする
                  </button>
                </li>
                {sireMatches.map((s) => (
                  <li key={s.id} className="border-b border-adm-rule last:border-b-0">
                    <button
                      type="button"
                      onClick={() => {
                        set('sireId', s.id);
                        setPickSire(false);
                        setSireQuery('');
                      }}
                      className="tap flex w-full items-center gap-2 px-3 py-2.5 text-left active:bg-adm-paper"
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
              {hasPups && (
                <p className="mt-1.5 text-[11px] leading-relaxed text-adm-muted">
                  父を変えると、この腹の仔犬{pups.length}頭の父も一緒に直ります。
                </p>
              )}
            </>
          )}
        </Row>

        <Row
          label="妊娠日数"
          hint={`${GEST_MIN}〜${GEST_MAX}日で入れます。分からない場合は「不明」にします`}
        >
          <Stepper
            value={f.gestationDays ?? GEST_MIN}
            onChange={(v) => set('gestationDays', v)}
            min={GEST_MIN}
            max={GEST_MAX}
            suffix="日"
            allowNull
            isNull={f.gestationDays === null}
            onNull={() => set('gestationDays', f.gestationDays === null ? GEST_MIN : null)}
          />
        </Row>

        <Row label="分娩方法">
          <div className="grid grid-cols-4 gap-1.5">
            {DELIVERY_METHODS.map((m) => (
              <MethodChip
                key={m}
                on={f.method === m}
                label={m}
                onClick={() => set('method', m)}
              />
            ))}
            <MethodChip on={f.method === null} label="未記入" onClick={() => set('method', null)} />
          </div>
        </Row>
      </FormSection>

      <FormSection
        title="産まれた数"
        note={`生存 ${f.male + f.female}頭`}
        help={
          hasPups ? (
            <>
              <b className="text-adm-ink">仔犬を登録済みなので♂♀の数は変えられません。</b>
              数が違うときは仔犬側で1頭ずつ足す・取り消すと、この数も一緒に直ります。
              死産の数は仔犬の行を作らないので、ここで直せます。
            </>
          ) : (
            <>まだ1頭も登録していないので、ここで数を直せます。</>
          )
        }
      >
        <Row label="♂ ♀ 死産">
          <div className="flex flex-col gap-2">
            <Stepper
              value={f.male}
              onChange={(v) => set('male', v)}
              min={0}
              max={COUNT_MAX}
              prefix="♂"
              disabled={hasPups}
            />
            <Stepper
              value={f.female}
              onChange={(v) => set('female', v)}
              min={0}
              max={COUNT_MAX}
              prefix="♀"
              disabled={hasPups}
            />
            <Stepper
              value={f.stillborn}
              onChange={(v) => set('stillborn', v)}
              min={0}
              max={COUNT_MAX}
              prefix="死産"
              danger
            />
          </div>
        </Row>
      </FormSection>

      <FormSection title="備考" note="犬舎内だけに残ります">
        <Row label="備考" htmlFor="note">
          <TextArea
            id="note"
            value={f.note}
            onChange={(v) => set('note', v)}
            rows={3}
            maxLength={2000}
            placeholder="剥離、次回は帝王切開 など"
          />
        </Row>
      </FormSection>

      {/* 出産日を動かすと何が直るのかを、保存する前に見せる */}
      <section className="px-4 pt-3.5">
        <h2 className="mb-2 text-[13px] font-bold tracking-wide">出産日を直すと一緒に直るもの</h2>
        <div className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3">
          {dateChanged ? (
            <p className="num text-[13px] font-bold">
              {ymd(initial.birthDate)} → <span className="text-adm-action">{ymd(f.birthDate)}</span>
            </p>
          ) : (
            <p className="text-[12.5px] text-adm-muted">出産日はまだ変えていません。</p>
          )}

          <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-adm-muted">
            <li>
              ・仔犬の誕生日と所有日　
              <b className="text-adm-ink">{followers.length}頭</b>
              {followers.length > 0 && (
                <span className="num">（{followers.map((p) => p.name).join('、')}）</span>
              )}
            </li>
            <li>・仔犬検診日（出産日＋49日）と次回交配可能月　自動で計算し直されます</li>
            {strays > 0 && (
              <li className="text-adm-danger">
                ・誕生日を個別に直した仔犬 {strays}頭 は動かしません。必要なら1頭ずつ直してください
              </li>
            )}
            {pups.length === 0 && <li>・この腹の仔犬はまだ登録されていません</li>}
          </ul>

          {dateChanged && (
            <p className="mt-2 border-t border-adm-rule pt-2 text-[11.5px] leading-relaxed text-adm-muted">
              仔犬の仮の名前（「{damName} ④ ♂1」など）に入っている回数は付けたときのままです。
              必要なら仔犬のカルテで名前を直してください。
            </p>
          )}
        </div>
      </section>

      {footer}

      <SaveBar
        busy={busy}
        onSave={submit}
        disabled={!dirty}
        label={dirty ? '保存する' : '変更はありません'}
      />
    </>
  );
}

function MethodChip({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={`tap rounded-lg border px-1 py-2 text-[13px] ${
        on
          ? 'border-adm-action bg-adm-action font-bold text-white'
          : 'border-adm-rule bg-adm-surface text-adm-muted'
      }`}
    >
      {label}
    </button>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-1.5 rounded border border-adm-rule bg-adm-paper px-1.5 py-px text-[10.5px] font-normal text-adm-muted">
      {children}
    </span>
  );
}
