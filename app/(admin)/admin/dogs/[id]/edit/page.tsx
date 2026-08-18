import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/server';
import { DogForm, type Master, type PartnerOption } from './DogForm';
import { RemovePuppy } from './RemovePuppy';
import { formatGenes, type DogEditInput } from './shared';
import type { DogStatus } from '@/app/_model/admin';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

type DogRow = {
  id: string;
  name: string;
  sex: string;
  breed_code: string;
  birthday: string | null;
  color_code: string | null;
  coat_type_code: string | null;
  ribbon_code: string | null;
  weight_kg: number | null;
  microchip: string | null;
  genes: string[] | null;
  status: DogStatus;
  died_on: string | null;
  death_cause: string | null;
  is_self_bred: boolean;
  breeder_id: string | null;
  supplier_id: string | null;
  acquired_on: string | null;
  note: string | null;
  litter_id: string | null;
  breeds: { name: string } | null;
};

export default async function EditDogPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: dogRaw } = await supabase
    .from('dogs')
    .select(
      `id, name, sex, breed_code, birthday, color_code, coat_type_code, ribbon_code,
       weight_kg, microchip, genes, status, died_on, death_cause,
       is_self_bred, breeder_id, supplier_id, acquired_on, note, litter_id,
       breeds ( name )`,
    )
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!dogRaw) notFound();
  const dog = dogRaw as unknown as DogRow;

  const [{ data: colors }, { data: coatTypes }, { data: ribbons }, { data: partners }, { count: litterCount }, { count: saleCount }] =
    await Promise.all([
      supabase.from('coat_colors').select('code, name, hex, hex2').order('name'),
      supabase.from('coat_types').select('code, name').order('code'),
      supabase.from('ribbon_colors').select('code, name, hex').order('code'),
      supabase.from('partners').select('id, name, license_no').is('deleted_at', null).order('name'),
      // 出産記録がある母犬は性別を変えられない。変えると出産の記録が母不明になる
      supabase
        .from('litters')
        .select('id', { count: 'exact', head: true })
        .eq('dam_id', id)
        .is('deleted_at', null),
      // 引き渡した記録がある子は登録を取り消せない
      supabase
        .from('sales')
        .select('id', { count: 'exact', head: true })
        .eq('dog_id', id)
        .is('deleted_at', null),
    ]);

  const initial: DogEditInput = {
    name: dog.name,
    sex: dog.sex === '♂' ? '♂' : '♀',
    birthday: dog.birthday ?? '',
    color_code: dog.color_code ?? '',
    coat_type_code: dog.coat_type_code ?? '',
    ribbon_code: dog.ribbon_code ?? '',
    weight_kg: dog.weight_kg === null ? '' : String(dog.weight_kg),
    microchip: dog.microchip ?? '',
    genes: formatGenes(dog.genes),
    status: dog.status,
    died_on: dog.died_on ?? '',
    death_cause: dog.death_cause ?? '',
    is_self_bred: dog.is_self_bred,
    breeder_id: dog.breeder_id ?? '',
    supplier_id: dog.supplier_id ?? '',
    acquired_on: dog.acquired_on ?? '',
    note: dog.note ?? '',
  };

  const hasLitters = (litterCount ?? 0) > 0;

  // 取り消せるのは「出産記録から作られた仔犬」で、引渡しも死亡もしていない子だけ
  const canRemove =
    dog.litter_id !== null && (saleCount ?? 0) === 0 && dog.status !== '引渡済' && dog.status !== '死亡';

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-adm-rule bg-adm-surface px-3 pb-2.5 pt-3">
        <Link
          href={`/admin/dogs/${id}`}
          aria-label="やめて戻る"
          className="tap flex w-[38px] items-center justify-center rounded-lg border border-adm-rule text-[15px] text-adm-muted"
        >
          ‹
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-bold tracking-tight">{dog.name} を編集</h1>
          <p className="text-[11.5px] text-adm-muted">保存を押すまで変わりません</p>
        </div>
      </header>

      <DogForm
        dogId={id}
        breedName={dog.breeds?.name ?? dog.breed_code}
        initial={initial}
        colors={(colors ?? []) as Master[]}
        coatTypes={(coatTypes ?? []) as Master[]}
        ribbons={(ribbons ?? []) as Master[]}
        partners={(partners ?? []) as PartnerOption[]}
        canChangeSex={!hasLitters}
        sexLockReason={hasLitters ? '出産の記録があるため変えられません' : undefined}
        footer={canRemove ? <RemovePuppy dogId={id} dogName={dog.name} /> : null}
      />
    </>
  );
}
