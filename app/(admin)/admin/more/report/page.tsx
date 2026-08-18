import Link from 'next/link';
import { createClient } from '@/app/_lib/supabase/server';
import { todayJst } from '@/app/_lib/admFormat';
import { BreedChip } from '@/app/(admin)/_components/Marks';
import { ReportCsv } from './ReportCsv';
import { defaultFiscalYear, fiscalRange, fiscalYearOf, inFilingWindow, type ReportRow } from './shared';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ fy?: string }> };

export default async function ReportPage({ searchParams }: Props) {
  const sp = await searchParams;
  const today = todayJst();
  const thisFy = fiscalYearOf(today);
  const parsed = Number(sp.fy);
  // 台帳の移行前まで遡っても意味がないので範囲を切る。
  // 未来の年度は数えても0にしかならないので選べない。
  const fy =
    Number.isInteger(parsed) && parsed >= 2015 && parsed <= thisFy ? parsed : defaultFiscalYear(today);
  const range = fiscalRange(fy);

  const supabase = await createClient();
  const [{ data: rowsRaw, error }, { data: breedsRaw }] = await Promise.all([
    supabase.rpc('fn_annual_report', { fy }),
    supabase.from('breeds').select('code, hex'),
  ]);

  const rows = (rowsRaw ?? []) as ReportRow[];
  const hex = new Map<string, string>(
    ((breedsRaw ?? []) as { code: string; hex: string }[]).map((b) => [b.code, b.hex]),
  );

  const sum = rows.reduce(
    (a, r) => ({
      opening_count: a.opening_count + r.opening_count,
      acquired_count: a.acquired_count + r.acquired_count,
      sold_count: a.sold_count + r.sold_count,
      died_count: a.died_count + r.died_count,
      closing_count: a.closing_count + r.closing_count,
    }),
    { opening_count: 0, acquired_count: 0, sold_count: 0, died_count: 0, closing_count: 0 },
  );

  /** ①＋②−③−④＝⑤ が合っているか。合わない年度は報告前に原因を調べる必要がある */
  const balanced = (r: {
    opening_count: number;
    acquired_count: number;
    sold_count: number;
    died_count: number;
    closing_count: number;
  }) => r.opening_count + r.acquired_count - r.sold_count - r.died_count === r.closing_count;

  const allBalanced = rows.every(balanced) && balanced(sum);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-adm-rule bg-adm-surface px-3 pb-2.5 pt-3">
        <Link
          href="/admin/more"
          aria-label="戻る"
          className="tap flex w-[38px] items-center justify-center rounded-lg border border-adm-rule text-[15px] text-adm-muted"
        >
          ‹
        </Link>
        <div className="min-w-0">
          <h1 className="text-[17px] font-bold tracking-tight">定期報告</h1>
          <p className="num text-[11.5px] text-adm-muted">
            {range.start.replace(/-/g, '/')} 〜 {range.end.replace(/-/g, '/')}
          </p>
        </div>
      </header>

      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <YearLink fy={fy - 1} label="‹ 前年度" />
        <p className="num text-[16px] font-bold">{fy}年度</p>
        <YearLink fy={fy + 1} label="翌年度 ›" disabled={fy >= thisFy} />
      </div>

      {inFilingWindow(today) && (
        <p className="mx-4 mt-3 rounded-xl border border-adm-action bg-adm-hint px-3.5 py-2.5 text-[12.5px] leading-relaxed text-adm-action">
          <b>いまは提出期間です。</b>
          {thisFy - 1}年度分を5月30日までに届け出てください。
        </p>
      )}

      {error && (
        <p className="mx-4 mt-3 rounded-xl border border-[#E3C9C7] bg-[#FBF3F2] px-3.5 py-2.5 text-[12.5px] text-adm-danger">
          集計できませんでした：{error.message}
        </p>
      )}

      <section className="px-4 pt-3.5">
        <div className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
          {rows.map((r) => (
            <div key={r.breed_code} className="border-b border-adm-rule px-3.5 py-3 last:border-b-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="flex items-center gap-2">
                  <BreedChip code={r.breed_code} hex={hex.get(r.breed_code)} />
                  <span className="text-[14px] font-bold">{r.breed_name}</span>
                </span>
                <span className="num text-[12px] text-adm-muted">
                  {balanced(r) ? '計算が合っています' : <span className="text-adm-danger">計算が合いません</span>}
                </span>
              </div>

              <dl className="mt-2 grid grid-cols-5 overflow-hidden rounded-lg border border-adm-rule">
                <Cell k="① 前年度末" v={r.opening_count} />
                <Cell k="② 所有" v={r.acquired_count} />
                <Cell k="③ 販売等" v={r.sold_count} />
                <Cell k="④ 死亡" v={r.died_count} />
                <Cell k="⑤ 当年度末" v={r.closing_count} strong />
              </dl>
            </div>
          ))}

          <div className="bg-adm-hint px-3.5 py-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[14px] font-bold">合計</span>
              <span className="num text-[12px] text-adm-muted">
                {allBalanced ? '① ＋ ② − ③ − ④ ＝ ⑤' : <span className="text-adm-danger">計算が合いません</span>}
              </span>
            </div>
            <dl className="mt-2 grid grid-cols-5 overflow-hidden rounded-lg border border-adm-rule bg-adm-surface">
              <Cell k="①" v={sum.opening_count} />
              <Cell k="②" v={sum.acquired_count} />
              <Cell k="③" v={sum.sold_count} />
              <Cell k="④" v={sum.died_count} />
              <Cell k="⑤" v={sum.closing_count} strong />
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-4 mt-3 rounded-xl border border-adm-rule bg-adm-hint px-3 py-2.5 text-[11.5px] leading-relaxed text-adm-muted">
        <b className="text-adm-ink">第一種動物取扱業者の定期報告です。毎年4月1日〜5月30日に、前年度分を届け出ます。</b>
        年度は4月はじまりで数えます。外部の種雄犬は自分の所有ではないので含めていません。
        数は帳簿の所有日・引渡し日・死亡日から自動で数えているので、
        <b className="text-adm-ink">帳簿の未入力を先に埋めてください</b>（帳簿の画面で確認できます）。
      </div>

      <ReportCsv rows={rows} fy={fy} />
    </>
  );
}

function YearLink({ fy, label, disabled }: { fy: number; label: string; disabled?: boolean }) {
  if (disabled) {
    return <span className="tap flex items-center px-3 text-[13px] text-adm-rule">{label}</span>;
  }
  return (
    <Link
      href={`/admin/more/report?fy=${fy}`}
      className="tap flex items-center rounded-lg border border-adm-rule px-3 text-[13px] text-adm-action"
    >
      {label}
    </Link>
  );
}

function Cell({ k, v, strong }: { k: string; v: number; strong?: boolean }) {
  return (
    <div className="border-r border-adm-rule px-1 py-2 text-center last:border-r-0">
      <dd className={`num leading-tight ${strong ? 'text-[17px] font-bold' : 'text-[15px]'}`}>{v}</dd>
      <dt className="mt-0.5 text-[9.5px] leading-tight text-adm-muted">{k}</dt>
    </div>
  );
}
