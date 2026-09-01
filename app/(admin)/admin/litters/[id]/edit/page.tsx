import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/server';
import { ymd } from '@/app/_lib/admFormat';
import type { DeliveryMethod } from '@/app/_model/admin';
import { LitterEditForm, type PupRow, type SireOption } from './LitterEditForm';
import { RemoveLitter } from './RemoveLitter';
import type { LitterEditInput } from './shared';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

type LitterRow = {
  id: string;
  dam_id: string;
  sire_id: string | null;
  birth_date: string;
  gestation_days: number | null;
  method: DeliveryMethod | null;
  male_count: number;
  female_count: number;
  stillborn_count: number;
  note: string | null;
};

export default async function EditLitterPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: litterRaw } = await supabase
    .from('litters')
    .select(
      `id, dam_id, sire_id, birth_date, gestation_days, method,
       male_count, female_count, stillborn_count, note`,
    )
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!litterRaw) notFound();
  const litter = litterRaw as unknown as LitterRow;

  const [{ data: damRaw }, { data: sireRows }, { data: pupRows }] = await Promise.all([
    supabase
      .from('dogs')
      .select('id, name, breed_code, breeds ( name )')
      .eq('id', litter.dam_id)
      .maybeSingle(),
    // 父は退役・外交配も選べる。過去の記録を入れ直すことがあるため。
    supabase
      .from('dogs')
      .select('id, name, breed_code, is_external, status, breeds ( name )')
      .is('deleted_at', null)
      .eq('sex', '♂')
      .in('status', ['在籍', '預託', '退役'])
      .order('name'),
    supabase
      .from('dogs')
      .select('id, name, sex, birthday')
      .eq('litter_id', id)
      .is('deleted_at', null)
      .order('sex')
      .order('name'),
  ]);

  if (!damRaw) notFound();
  type DamRow = { id: string; name: string; breed_code: string; breeds: { name: string } | null };
  const dam = damRaw as unknown as DamRow;

  type SireRow = {
    id: string;
    name: string;
    breed_code: string;
    is_external: boolean;
    status: string;
    breeds: { name: string } | null;
  };
  const sires: SireOption[] = ((sireRows ?? []) as unknown as SireRow[]).map((s) => ({
    id: s.id,
    name: s.name,
    breed_code: s.breed_code,
    breed_name: s.breeds?.name ?? s.breed_code,
    is_external: s.is_external,
    status: s.status,
  }));

  const pups = (pupRows ?? []) as PupRow[];

  const initial: LitterEditInput = {
    birthDate: litter.birth_date,
    sireId: litter.sire_id ?? '',
    gestationDays: litter.gestation_days,
    method: litter.method,
    male: litter.male_count,
    female: litter.female_count,
    stillborn: litter.stillborn_count,
    note: litter.note ?? '',
  };

  // 取り消せるのは仔犬が1頭もぶら下がっていない記録だけ
  const blockedReason =
    pups.length > 0
      ? `この出産には仔犬が${pups.length}頭ぶら下がっているため取り消せません。先に仔犬の登録を1頭ずつ取り消してください。`
      : undefined;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-adm-rule bg-adm-surface px-3 pb-2.5 pt-3">
        <Link
          href={`/admin/dogs/${litter.dam_id}?t=${encodeURIComponent('出産')}`}
          aria-label="やめて戻る"
          className="tap flex w-[38px] items-center justify-center rounded-lg border border-adm-rule text-[15px] text-adm-muted"
        >
          ‹
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-bold tracking-tight">出産の記録を直す</h1>
          <p className="num text-[11.5px] text-adm-muted">
            {dam.name}　{ymd(litter.birth_date)}　保存を押すまで変わりません
          </p>
        </div>
      </header>

      <LitterEditForm
        litterId={litter.id}
        damId={litter.dam_id}
        damName={dam.name}
        damBreedCode={dam.breed_code}
        initial={initial}
        sires={sires}
        pups={pups}
        footer={
          <RemoveLitter
            litterId={litter.id}
            label={`${dam.name} ${ymd(litter.birth_date)}`}
            blockedReason={blockedReason}
          />
        }
      />
    </>
  );
}
