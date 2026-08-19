'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DateField, FormSection, Notice, Row, SaveBar, Segment, TextArea } from '@/app/(admin)/_components/Form';
import { BreedBar } from '@/app/(admin)/_components/Marks';
import { ymd, ymdJp } from '@/app/_lib/admFormat';
import { saveVaccinations } from './actions';
import {
  MAX_AT_ONCE,
  TARGET_FILTERS,
  isDue,
  type TargetFilterKey,
  type VaccineTarget,
} from './shared';

/**
 * ワクチンをまとめて記録する。
 *
 * 同じ日に何頭もまとめて打つのが実際のやり方なので、
 * 「種類と日付を1回決めて、打った犬にチェックを付ける」形にしている。
 * 同じ腹の仔犬は一斉に打つことが多いので、腹ごとにまとめて選べるようにした。
 */
export function VaccineForm({
  kinds,
  targets,
  today,
  initialKind,
  initialDogId,
}: {
  kinds: string[];
  targets: VaccineTarget[];
  today: string;
  initialKind: string;
  initialDogId?: string;
}) {
  const router = useRouter();
  const [kind, setKind] = useState(initialKind);
  const [dosedOn, setDosedOn] = useState(today);
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState<TargetFilterKey>(initialDogId ? 'all' : 'due');
  const [picked, setPicked] = useState<Set<string>>(new Set(initialDogId ? [initialDogId] : []));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const shown = useMemo(() => {
    return targets.filter((t) => {
      if (filter === 'due') return isDue(t.due[kind], today);
      if (filter === 'puppy') return t.litter_id !== null;
      return true;
    });
  }, [targets, filter, kind, today]);

  // 仔犬は腹ごと、それ以外は「親犬」でまとめる
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; date: string | null; items: VaccineTarget[] }>();
    for (const t of shown) {
      const key = t.litter_id ?? '_parents';
      if (!map.has(key)) {
        map.set(key, {
          label: t.litter_label ?? '親犬',
          date: t.litter_date,
          items: [],
        });
      }
      map.get(key)!.items.push(t);
    }
    return [...map.entries()].sort((a, b) => {
      if (a[0] === '_parents') return 1;
      if (b[0] === '_parents') return -1;
      return (b[1].date ?? '').localeCompare(a[1].date ?? '');
    });
  }, [shown]);

  const toggle = (id: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setDone('');
    setError('');
  };

  const setMany = (ids: string[], on: boolean) => {
    setPicked((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
    setDone('');
    setError('');
  };

  const shownIds = shown.map((t) => t.id);
  const allShownPicked = shownIds.length > 0 && shownIds.every((id) => picked.has(id));

  async function submit() {
    setBusy(true);
    setError('');
    setDone('');
    const res = await saveVaccinations({ kind, dosedOn, dogIds: [...picked], note });
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setPicked(new Set());
    setDone(
      res.skipped > 0
        ? `${res.inserted}頭に記録しました。すでに同じ日の記録があった${res.skipped}頭は飛ばしました。`
        : `${res.inserted}頭に記録しました。`,
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.refresh();
  }

  return (
    <>
      {error && <Notice kind="error">{error}</Notice>}
      {!error && done && <Notice kind="ok">{done}</Notice>}

      <FormSection title="何を・いつ">
        <Row label="ワクチンの種類">
          <Segment
            label="ワクチンの種類"
            value={kind}
            onChange={(v) => {
              setKind(v);
              setDone('');
            }}
            options={kinds.map((k) => ({ value: k, label: k }))}
          />
        </Row>
        <Row
          label="接種日"
          htmlFor="dosedOn"
          hint={<span className="font-bold text-adm-ink">{ymdJp(dosedOn)}</span>}
        >
          <DateField id="dosedOn" value={dosedOn} onChange={setDosedOn} />
        </Row>
        <Row label="メモ" htmlFor="note" hint="選んだ犬すべてに同じ内容が入ります（病院名など）">
          <TextArea id="note" value={note} onChange={setNote} rows={2} maxLength={200} />
        </Row>
      </FormSection>

      <section className="px-4 pt-3.5">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h2 className="text-[13px] font-bold tracking-wide">打った犬を選ぶ</h2>
          <span className="num text-[12px] text-adm-muted">
            {picked.size}頭を選択中
          </span>
        </div>

        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TARGET_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] leading-6 ${
                f.key === filter
                  ? 'border-adm-action bg-adm-action font-medium text-white'
                  : 'border-adm-rule bg-adm-surface text-adm-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
          {shownIds.length > 0 && (
            <button
              type="button"
              onClick={() => setMany(shownIds, !allShownPicked)}
              className="ml-auto shrink-0 rounded-full border border-adm-rule bg-adm-surface px-3.5 py-1.5 text-[12.5px] leading-6 text-adm-action"
            >
              {allShownPicked ? 'すべて外す' : 'すべて選ぶ'}
            </button>
          )}
        </div>

        {groups.length === 0 ? (
          <p className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 text-[12.5px] leading-relaxed text-adm-muted">
            {filter === 'due'
              ? `${kind}の期限が来ている犬はいません。「すべて」に切り替えると全頭から選べます。`
              : '該当する犬がいません。'}
          </p>
        ) : (
          <div className="space-y-2.5">
            {groups.map(([key, g]) => {
              const ids = g.items.map((t) => t.id);
              const allOn = ids.every((id) => picked.has(id));
              return (
                <div key={key} className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
                  <div className="flex items-center justify-between gap-2 border-b border-adm-rule bg-adm-paper px-3.5 py-2">
                    <span className="min-w-0 text-[12.5px] font-bold">
                      {g.label}
                      {g.date && <span className="num ml-2 font-normal text-adm-muted">{ymd(g.date)}</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMany(ids, !allOn)}
                      className="shrink-0 rounded-lg border border-adm-rule bg-adm-surface px-2.5 py-1 text-[11.5px] text-adm-action"
                    >
                      {allOn ? 'この組を外す' : `この組${g.items.length}頭を選ぶ`}
                    </button>
                  </div>

                  <ul>
                    {g.items.map((t) => {
                      const on = picked.has(t.id);
                      const d = t.due[kind];
                      const overdue = isDue(d, today);
                      return (
                        <li key={t.id} className="border-b border-adm-rule last:border-b-0">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={on}
                            onClick={() => toggle(t.id)}
                            className={`tap flex w-full items-center gap-3 px-3.5 py-2.5 text-left ${
                              on ? 'bg-adm-hint' : ''
                            }`}
                          >
                            <span
                              aria-hidden
                              className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border text-[13px] font-bold ${
                                on
                                  ? 'border-adm-action bg-adm-action text-white'
                                  : 'border-adm-rule bg-adm-surface text-transparent'
                              }`}
                            >
                              ✓
                            </span>
                            <BreedBar hex={t.breed_hex} label={t.breed_name} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-medium">
                                {t.name}
                                {!t.name.includes(t.sex) && (
                                  <span className="num ml-1.5 text-[11.5px] font-normal text-adm-muted">
                                    {t.sex}
                                  </span>
                                )}
                              </span>
                              <span className="num block truncate text-[11px] text-adm-muted">
                                前回 {d?.last ? ymd(d.last) : '記録なし'}
                                {d?.next && `　次回 ${ymd(d.next)}`}
                              </span>
                            </span>
                            {overdue && (
                              <span className="shrink-0 rounded border border-[#E3C9C7] bg-[#FBF3F2] px-1.5 py-px text-[10.5px] text-adm-danger">
                                期限
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-2.5 rounded-xl border border-adm-rule bg-adm-hint px-3 py-2.5 text-[11.5px] leading-relaxed text-adm-muted">
          記録するとその犬の次回予定日が計算し直され、ホームのアラートから消えます。
          <b className="text-adm-ink">同じ犬・同じ種類・同じ日の記録が既にある場合は飛ばします</b>
          ので、二度押しても増えません。一度に記録できるのは{MAX_AT_ONCE}頭までです。
        </p>
      </section>

      <SaveBar
        busy={busy}
        onSave={submit}
        disabled={picked.size === 0}
        label={picked.size === 0 ? '打った犬を選んでください' : `${picked.size}頭に記録する`}
      />
    </>
  );
}
