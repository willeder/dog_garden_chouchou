import Link from 'next/link';
import { createClient } from '@/app/_lib/supabase/server';
import { ymd, ym, todayJst, monthStart, shiftMonth, isOverdue } from '@/app/_lib/admFormat';
import { ALERT_CATEGORIES, type AlertRow, type Breed } from '@/app/_model/admin';
import { BreedBar } from '@/app/(admin)/_components/Marks';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ m?: string }> };

/** アラートの見出し → ワクチンの種類。交配可能・仔犬検診には記録画面が無い */
const VACCINE_KIND: Record<string, string | undefined> = {
  混合ワクチン: '混合',
  狂犬病ワクチン: '狂犬病',
};

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams;
  const today = todayJst();
  const [ty, tm] = today.split('-').map(Number);

  // ?m=2026-08 形式。壊れた値が来ても今月に落とす。
  const month = /^\d{4}-\d{2}$/.test(sp.m ?? '')
    ? `${sp.m}-01`
    : monthStart(ty, tm);

  const supabase = await createClient();

  const [{ data: alerts }, { data: breeds }] = await Promise.all([
    supabase.rpc('fn_monthly_alerts', { target_month: month }),
    supabase.from('breeds').select('code, name, hex'),
  ]);

  const breedMap = new Map<string, Breed>((breeds ?? []).map((b: Breed) => [b.code, b]));
  const rows = (alerts ?? []) as AlertRow[];

  const isThisMonth = month === monthStart(ty, tm);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-adm-rule bg-adm-surface px-4 pb-2.5 pt-3">
        <h1 className="text-[17px] font-bold tracking-tight">今月やること</h1>
        <p className="num text-[11.5px] text-adm-muted">ドッグガーデンシュシュ</p>
      </header>

      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <MonthButton to={shiftMonth(month, -1)} label="前の月">‹</MonthButton>
        <div className="text-center">
          <div className="num text-[19px] font-bold leading-tight">{ym(month)}</div>
          {!isThisMonth && (
            <Link href="/admin" className="text-[11.5px] text-adm-action underline underline-offset-2">
              今月に戻る
            </Link>
          )}
        </div>
        <MonthButton to={shiftMonth(month, 1)} label="次の月">›</MonthButton>
      </div>

      {ALERT_CATEGORIES.map((cat) => {
        const items = rows.filter((r) => r.category === cat);
        return (
          <section key={cat} className="px-4 pt-3.5">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 className="text-[13px] font-bold tracking-wide">{cat}</h2>
              <span className="flex items-baseline gap-2.5">
                {/* ワクチンは同じ日に何頭もまとめて打つ。ここから一覧で選んで記録できる */}
                {VACCINE_KIND[cat] && (
                  <Link
                    href={`/admin/vaccinations/new?kind=${encodeURIComponent(VACCINE_KIND[cat])}`}
                    className="text-[11.5px] text-adm-action underline underline-offset-2"
                  >
                    まとめて記録
                  </Link>
                )}
                <span className="num text-[12px] text-adm-muted">{items.length}件</span>
              </span>
            </div>

            {items.length === 0 ? (
              // 0件も必ず出す。抜けているのか対象がないのか分からないと、
              // 結局スプレッドシートを確認しに行くことになる。
              <p className="rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 text-[12.5px] text-adm-muted">
                対象なし
              </p>
            ) : (
              <ul className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
                {items.map((r, i) => {
                  const breed = breedMap.get(r.breed_code);
                  const over = isOverdue(r.due_on, month);
                  return (
                    <li key={`${r.category}-${r.dog_id}-${i}`} className="border-b border-adm-rule last:border-b-0">
                      <Link
                        href={`/admin/dogs/${r.dog_id}`}
                        className="tap flex items-center gap-3 px-3.5 py-2.5 active:bg-adm-paper"
                      >
                        <BreedBar hex={breed?.hex} label={breed?.name} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium">{r.dog_name}</span>
                          <span className="block truncate text-[11.5px] text-adm-muted">
                            {r.detail && r.detail !== '期限超過' ? r.detail : breed?.name ?? r.breed_code}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="num block text-[13px]">
                            {cat === '交配可能' ? `${ym(r.due_on)}〜` : ymd(r.due_on)}
                          </span>
                          {over && <span className="block text-[11px] text-adm-danger">期限超過</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      <div className="px-4 pt-5">
        <Link
          href="/admin/litters/new"
          className="tap flex items-center justify-center rounded-xl border border-adm-action bg-adm-surface px-4 py-3 text-[14px] font-bold text-adm-action"
        >
          ＋ 出産を記録
        </Link>
      </div>

      <p className="px-4 py-6 text-[11.5px] leading-relaxed text-adm-muted">
        退役・引渡済・死亡の犬と外交配の♂は対象外です。犬名を押すとカルテが開きます。
      </p>
    </>
  );
}

function MonthButton({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/admin?m=${to.slice(0, 7)}`}
      aria-label={label}
      className="tap flex w-[44px] items-center justify-center rounded-lg border border-adm-rule bg-adm-surface text-[15px] text-adm-muted"
    >
      {children}
    </Link>
  );
}
