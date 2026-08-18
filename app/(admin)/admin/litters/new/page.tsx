import Link from 'next/link';
import { createClient } from '@/app/_lib/supabase/server';
import { LitterForm, type DamOption, type SireOption } from './LitterForm';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ dam?: string }> };

export default async function NewLitterPage({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data: damRows }, { data: sireRows }, { data: summaryRows }] = await Promise.all([
    supabase
      .from('dogs')
      .select('id, name, breed_code, breeds ( name, hex )')
      .is('deleted_at', null)
      .eq('sex', '♀')
      .eq('is_external', false)
      .in('status', ['在籍', '預託'])
      .order('name'),
    // 父は退役・外交配も選べる。過去の記録を入れ直すことがあるため。
    supabase
      .from('dogs')
      .select('id, name, breed_code, is_external, status, breeds ( name )')
      .is('deleted_at', null)
      .eq('sex', '♂')
      .in('status', ['在籍', '預託', '退役'])
      .order('name'),
    supabase.from('v_dam_summary').select('dog_id, litter_count, last_birth_date'),
  ]);

  type Sum = { dog_id: string; litter_count: number | null; last_birth_date: string | null };
  const sum = new Map<string, Sum>(((summaryRows ?? []) as unknown as Sum[]).map((s) => [s.dog_id, s]));

  type DamRow = { id: string; name: string; breed_code: string; breeds: { name: string; hex: string } | null };
  const dams: DamOption[] = ((damRows ?? []) as unknown as DamRow[])
    .map((d) => ({
      id: d.id,
      name: d.name,
      breed_code: d.breed_code,
      breed_name: d.breeds?.name ?? d.breed_code,
      breed_hex: d.breeds?.hex ?? '#8A93A0',
      last_birth_date: sum.get(d.id)?.last_birth_date ?? null,
      litter_count: sum.get(d.id)?.litter_count ?? 0,
    }))
    // 直近に産んだ母犬を上に。記録するのはたいてい最近の出産。
    .sort((a, b) => (b.last_birth_date ?? '').localeCompare(a.last_birth_date ?? ''));

  type SireRow = {
    id: string; name: string; breed_code: string; is_external: boolean;
    status: string; breeds: { name: string } | null;
  };
  const sires: SireOption[] = ((sireRows ?? []) as unknown as SireRow[]).map((s) => ({
    id: s.id,
    name: s.name,
    breed_code: s.breed_code,
    breed_name: s.breeds?.name ?? s.breed_code,
    is_external: s.is_external,
    status: s.status,
  }));

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-adm-rule bg-adm-surface px-3 pb-2.5 pt-3">
        <Link
          href={sp.dam ? `/admin/dogs/${sp.dam}` : '/admin/dogs'}
          aria-label="戻る"
          className="tap flex w-[38px] items-center justify-center rounded-lg border border-adm-rule text-[15px] text-adm-muted"
        >
          ‹
        </Link>
        <div>
          <h1 className="text-[17px] font-bold tracking-tight">出産を記録</h1>
          <p className="text-[11.5px] text-adm-muted">仔犬検診日と次回交配月は自動で計算されます</p>
        </div>
      </header>

      <LitterForm dams={dams} sires={sires} initialDamId={sp.dam} />
    </>
  );
}
