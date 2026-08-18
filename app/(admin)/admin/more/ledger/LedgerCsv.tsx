'use client';

import { useState } from 'react';
import { downloadCsv, toCsv } from '@/app/_lib/csv';
import { LEDGER_COLUMNS, type LedgerRow } from './columns';

/**
 * 帳簿をCSVで書き出す。
 *
 * サーバーには送らず、表示に使っているデータからその場で作る。
 * 役所への提出は自治体ごとに様式が違うため、こちらで様式は決めず、
 * 項目をそのまま並べたCSVを出して、あとはExcelで整えてもらう方針。
 */
export function LedgerCsv({ rows, fileDate }: { rows: LedgerRow[]; fileDate: string }) {
  const [done, setDone] = useState(false);

  function run() {
    const csv = toCsv(
      [...LEDGER_COLUMNS],
      rows.map((r) => LEDGER_COLUMNS.map((c) => r[c] ?? '')),
    );
    downloadCsv(`chouchou-ledger-${fileDate}.csv`, csv);
    setDone(true);
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
          {done ? 'もう一度 書き出す' : `CSVで書き出す（${rows.length}頭）`}
        </button>
      </div>
    </>
  );
}
