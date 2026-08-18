'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPuppies } from '../litters/new/actions';
import { ymd, ageLabel } from '@/app/_lib/admFormat';

export type PendingLitter = {
  id: string;
  dam_id: string;
  dam_name: string;
  breed_name: string;
  breed_hex: string | null;
  birth_date: string;
  male_count: number;
  female_count: number;
  stillborn_count: number;
};

/**
 * 生まれた記録はあるが、まだ1頭ずつ登録していない出産。
 *
 * 移行した91件の出産は「♂2 ♀1」という頭数だけで、個体の行が無い。
 * ここから頭数ぶんの仔犬を作れるようにしておかないと、
 * 出産を記録し直さない限り仔犬を登録できない、という行き止まりになる。
 */
export function UnregisteredLitters({
  litters,
  today,
  showingAll,
  hiddenCount,
}: {
  litters: PendingLitter[];
  today: string;
  showingAll: boolean;
  hiddenCount: number;
}) {
  if (litters.length === 0 && hiddenCount === 0) return null;

  return (
    <section className="px-4 pt-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-[13px] font-bold tracking-wide">まだ登録していない出産</h2>
        <span className="num text-[12px] text-adm-muted">{litters.length}件</span>
      </div>

      <p className="mb-2 rounded-xl border border-adm-rule bg-adm-hint px-3 py-2.5 text-[11.5px] leading-relaxed text-adm-muted">
        生まれた記録はありますが、1頭ずつの登録がまだの出産です。
        <b className="text-adm-ink">押すと記録どおりの頭数が仮の名前で作られます。</b>
        あとから1頭ずつ名前・毛色・紐の色を入れてください。
      </p>

      <ul className="space-y-2">
        {litters.map((l) => (
          <li key={l.id}>
            <Card l={l} today={today} />
          </li>
        ))}
      </ul>

      {!showingAll && hiddenCount > 0 && (
        <Link
          href="/admin/puppies?pending=all"
          className="tap mt-2 flex items-center justify-center rounded-xl border border-adm-rule bg-adm-surface px-4 py-2.5 text-[13px] text-adm-action"
        >
          もっと前の出産も見る（あと{hiddenCount}件）
        </Link>
      )}
      {showingAll && (
        <Link
          href="/admin/puppies"
          className="tap mt-2 flex items-center justify-center rounded-xl border border-adm-rule bg-adm-surface px-4 py-2.5 text-[13px] text-adm-action"
        >
          直近だけ表示する
        </Link>
      )}
    </section>
  );
}

function Card({ l, today }: { l: PendingLitter; today: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [, startTransition] = useTransition();

  const alive = l.male_count + l.female_count;

  async function run() {
    setBusy(true);
    setErr('');
    const res = await createPuppies(l.id);
    setBusy(false);
    if (!res.ok) {
      setErr(res.message);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
      <div className="flex items-start gap-3 px-3.5 pt-3">
        <span
          className="mt-0.5 h-9 w-1 shrink-0 rounded-full"
          style={{ background: l.breed_hex || '#8A93A0' }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-bold">
            <Link href={`/admin/dogs/${l.dam_id}`} className="text-adm-action">
              {l.dam_name}
            </Link>
            <span className="ml-2 text-[11.5px] font-normal text-adm-muted">{l.breed_name}</span>
          </p>
          <p className="num text-[11.5px] text-adm-muted">
            {ymd(l.birth_date)}　{ageLabel(l.birth_date, today)}
          </p>
          <p className="num mt-1 text-[12.5px]">
            ♂ {l.male_count}　♀ {l.female_count}
            {l.stillborn_count > 0 && (
              <span className="ml-2 text-[11.5px] text-adm-muted">死産 {l.stillborn_count}</span>
            )}
          </p>
        </div>
      </div>

      <div className="px-3.5 pb-3 pt-2.5">
        {alive === 0 ? (
          <p className="text-[12px] text-adm-muted">生存頭数が0なので登録するものがありません。</p>
        ) : (
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="tap w-full rounded-xl bg-adm-action px-4 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-40"
          >
            {busy ? '登録中…' : `${alive}頭を登録する`}
          </button>
        )}
        {err && <p className="mt-2 text-[12px] leading-relaxed text-adm-danger">{err}</p>}
      </div>
    </div>
  );
}
