import Link from 'next/link';
import { createClient } from '@/app/_lib/supabase/server';
import { PartnerList } from './PartnerList';
import type { PartnerListItem } from './shared';

export const dynamic = 'force-dynamic';

export default async function PartnersPage() {
  const supabase = await createClient();

  const [{ data: partnersRaw }, { data: dogsRaw }] = await Promise.all([
    supabase
      .from('partners')
      .select('id, name, contact_name, license_no, phone, note')
      .is('deleted_at', null)
      .order('name'),
    // 紐付き数を数える。件数が少ないので、まとめて引いて画面側で数える
    supabase.from('dogs').select('breeder_id, supplier_id').is('deleted_at', null),
  ]);

  const used = new Map<string, number>();
  for (const d of (dogsRaw ?? []) as { breeder_id: string | null; supplier_id: string | null }[]) {
    for (const key of [d.breeder_id, d.supplier_id]) {
      if (key) used.set(key, (used.get(key) ?? 0) + 1);
    }
  }

  type Row = Omit<PartnerListItem, 'used'>;
  const items: PartnerListItem[] = ((partnersRaw ?? []) as Row[]).map((p) => ({
    ...p,
    used: used.get(p.id) ?? 0,
  }));

  const withLicense = items.filter((p) => p.license_no).length;

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
          <h1 className="text-[17px] font-bold tracking-tight">相手先</h1>
          <p className="num text-[11.5px] text-adm-muted">
            {items.length}件　登録番号あり {withLicense}件
          </p>
        </div>
      </header>

      <PartnerList items={items} />
    </>
  );
}
