import Link from 'next/link';
import { createClient } from '@/app/_lib/supabase/server';
import { ymd, todayJst } from '@/app/_lib/admFormat';
import { BreedBar } from '@/app/(admin)/_components/Marks';
import { LedgerCsv } from './LedgerCsv';
import {
  LEDGER_FILTERS,
  missingItems,
  type LedgerFilterKey,
  type LedgerItem,
  type LedgerRow,
} from './columns';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ f?: string }> };

export default async function LedgerPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filter: LedgerFilterKey =
    (LEDGER_FILTERS.find((f) => f.key === sp.f)?.key as LedgerFilterKey) ?? 'all';

  const supabase = await createClient();

  // 帳簿の中身はビューが持つ。状態と犬種の色はアプリ表示用に別で引く。
  const [{ data: ledgerRaw }, { data: dogsRaw }] = await Promise.all([
    supabase.from('v_ledger').select('*'),
    supabase
      .from('dogs')
      .select('id, status, is_self_bred, breeds ( hex )')
      .is('deleted_at', null)
      .eq('is_external', false),
  ]);

  type DogMeta = { id: string; status: string; is_self_bred: boolean; breeds: { hex: string } | null };
  const meta = new Map<string, DogMeta>(
    ((dogsRaw ?? []) as unknown as DogMeta[]).map((d) => [d.id, d]),
  );

  const items: LedgerItem[] = ((ledgerRaw ?? []) as LedgerRow[]).map((row) => {
    const m = meta.get(row.id);
    const status = m?.status ?? '';
    const isSelfBred = m?.is_self_bred ?? false;
    return {
      row,
      status,
      isSelfBred,
      breedHex: m?.breeds?.hex ?? null,
      missing: missingItems(row, status, isSelfBred),
    };
  });

  const shown = items
    .filter((it) => {
      if (filter === 'missing') return it.missing.length > 0;
      if (filter === 'here') return !['引渡済', '死亡'].includes(it.status);
      if (filter === 'sold') return it.status === '引渡済';
      if (filter === 'died') return it.status === '死亡';
      return true;
    })
    .sort((a, b) => {
      // 不足が多い順 → 名前順。直すべきものを上に出す
      const d = b.missing.length - a.missing.length;
      if (d !== 0) return d;
      return String(a.row['個体の名前'] ?? '').localeCompare(String(b.row['個体の名前'] ?? ''), 'ja');
    });

  const missingTotal = items.filter((it) => it.missing.length > 0).length;
  const today = todayJst();

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
          <h1 className="text-[17px] font-bold tracking-tight">帳簿</h1>
          <p className="num text-[11.5px] text-adm-muted">
            {items.length}頭　
            {missingTotal > 0 ? (
              <span className="text-adm-danger">不足あり {missingTotal}頭</span>
            ) : (
              <span>不足なし</span>
            )}
          </p>
        </div>
      </header>

      <div className="flex gap-1.5 overflow-x-auto px-4 pb-0.5 pt-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LEDGER_FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/admin/more/ledger' : `/admin/more/ledger?f=${f.key}`}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] leading-6 ${
              f.key === filter
                ? 'border-adm-action bg-adm-action font-medium text-white'
                : 'border-adm-rule bg-adm-surface text-adm-muted'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mx-4 mt-3.5 rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 text-[12.5px] leading-relaxed text-adm-muted">
          該当する犬がいません。
        </p>
      ) : (
        <ul className="mx-4 mt-3.5 overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
          {shown.map((it) => (
            <li key={it.row.id} className="border-b border-adm-rule last:border-b-0">
              <Link
                href={`/admin/dogs/${it.row.id}/edit`}
                className="tap flex items-center gap-3 px-3.5 py-2.5 active:bg-adm-paper"
              >
                <BreedBar hex={it.breedHex} label={String(it.row['品種等の名称'] ?? '')} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-medium">
                    {String(it.row['個体の名前'] ?? '（名前なし）')}
                    <span className="ml-1.5 text-[11.5px] font-normal text-adm-muted">
                      {String(it.row['品種等の名称'] ?? '')}
                    </span>
                  </span>
                  <span className="num block truncate text-[11.5px] text-adm-muted">
                    生 {ymd(it.row['生年月日'] as string)}　所有 {ymd(it.row['所有した日'] as string)}
                  </span>
                  {it.missing.length > 0 && (
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-adm-danger">
                      未入力：{it.missing.join('・')}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[11.5px] text-adm-muted">{it.status}</span>
                  {it.missing.length > 0 && (
                    <span className="num block text-[12px] font-bold text-adm-danger">
                      {it.missing.length}件
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mx-4 mt-3 rounded-xl border border-adm-rule bg-adm-hint px-3 py-2.5 text-[11.5px] leading-relaxed text-adm-muted">
        <b className="text-adm-ink">動物愛護管理法で保存が義務づけられている帳簿です。</b>
        記録は5年間残す必要があるため、この画面から消すことはできません。
        名前を押すとその犬の編集画面が開きます。
        CSVはExcelでそのまま開けます（提出様式は自治体ごとに違うため、書き出したあとで整えてください）。
      </div>

      <LedgerCsv rows={shown.map((it) => it.row)} fileDate={today.replace(/-/g, '')} />
    </>
  );
}
