'use client';

import { downloadCsv, toCsv } from '@/app/_lib/csv';
import type { ReportRow } from './shared';
import { REPORT_HEADERS } from './shared';

export function ReportCsv({ rows, fy }: { rows: ReportRow[]; fy: number }) {
  function run() {
    const csv = toCsv(
      [...REPORT_HEADERS],
      rows.map((r) => [
        r.breed_name,
        r.opening_count,
        r.acquired_count,
        r.sold_count,
        r.died_count,
        r.closing_count,
      ]),
    );
    downloadCsv(`chouchou-report-${fy}fy.csv`, csv);
  }

  return (
    <>
      <div className="h-24" />
      <div className="fixed inset-x-0 bottom-[58px] z-20 mx-auto max-w-2xl px-4 pb-3">
        <button
          type="button"
          onClick={run}
          className="tap flex w-full items-center justify-center rounded-xl bg-adm-action px-4 py-3.5 text-[14.5px] font-bold text-white shadow-lg"
        >
          CSVで書き出す
        </button>
      </div>
    </>
  );
}
