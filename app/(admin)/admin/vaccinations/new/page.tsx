import Link from 'next/link';
import { createClient } from '@/app/_lib/supabase/server';
import { todayJst, ymd } from '@/app/_lib/admFormat';
import { VaccineForm } from './VaccineForm';
import type { VaccineTarget } from './shared';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ kind?: string; dog?: string; from?: string }> };

export default async function NewVaccinationPage({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = await createClient();
  const today = todayJst();

  const [{ data: kindRows }, { data: dogsRaw }, { data: dueRaw }, { data: littersRaw }] =
    await Promise.all([
      supabase.from('vaccine_schedules').select('kind').order('kind'),
      // 打つ対象は犬舎にいる犬だけ。v_vaccine_due と同じ条件にそろえる。
      supabase
        .from('dogs')
        .select('id, name, sex, breed_code, birthday, status, litter_id, breeds ( name, hex )')
        .is('deleted_at', null)
        .eq('is_external', false)
        // 除外ではなく許可する状態を並べる。日本語の値を not-in に渡すと
        // 引用符の扱いで取りこぼす恐れがあるため、入れてよいものだけを書く。
        .in('status', ['在舎', '商談中', '売約', '在籍', '預託'])
        .order('name'),
      supabase.from('v_vaccine_due').select('dog_id, kind, last_dosed_on, next_due_on'),
      supabase.from('v_litters').select('id, dam_name, birth_date'),
    ]);

  const kinds = ((kindRows ?? []) as { kind: string }[]).map((k) => k.kind);
  const initialKind = kinds.includes(sp.kind ?? '') ? (sp.kind as string) : (kinds[0] ?? '混合');

  type DogRow = {
    id: string; name: string; sex: string; breed_code: string; birthday: string | null;
    status: string; litter_id: string | null; breeds: { name: string; hex: string } | null;
  };
  const dogs = (dogsRaw ?? []) as unknown as DogRow[];

  const dueMap = new Map<string, Record<string, { last: string | null; next: string | null }>>();
  for (const d of (dueRaw ?? []) as {
    dog_id: string; kind: string; last_dosed_on: string | null; next_due_on: string | null;
  }[]) {
    const cur = dueMap.get(d.dog_id) ?? {};
    cur[d.kind] = { last: d.last_dosed_on, next: d.next_due_on };
    dueMap.set(d.dog_id, cur);
  }

  const litterMap = new Map<string, { label: string; date: string }>();
  for (const l of (littersRaw ?? []) as { id: string; dam_name: string; birth_date: string }[]) {
    litterMap.set(l.id, { label: `${l.dam_name} の仔犬`, date: l.birth_date });
  }

  const targets: VaccineTarget[] = dogs.map((d) => {
    const lit = d.litter_id ? litterMap.get(d.litter_id) : undefined;
    return {
      id: d.id,
      name: d.name,
      sex: d.sex,
      breed_code: d.breed_code,
      breed_name: d.breeds?.name ?? d.breed_code,
      breed_hex: d.breeds?.hex ?? null,
      birthday: d.birthday,
      status: d.status,
      litter_id: d.litter_id,
      litter_label: lit?.label ?? null,
      litter_date: lit?.date ?? null,
      due: dueMap.get(d.id) ?? {},
    };
  });

  const back = sp.dog ? `/admin/dogs/${sp.dog}?t=${encodeURIComponent('ワクチン')}` : '/admin';

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-adm-rule bg-adm-surface px-3 pb-2.5 pt-3">
        <Link
          href={back}
          aria-label="戻る"
          className="tap flex w-[38px] items-center justify-center rounded-lg border border-adm-rule text-[15px] text-adm-muted"
        >
          ‹
        </Link>
        <div className="min-w-0">
          <h1 className="text-[17px] font-bold tracking-tight">ワクチンを記録</h1>
          <p className="num text-[11.5px] text-adm-muted">
            対象 {targets.length}頭　今日 {ymd(today)}
          </p>
        </div>
      </header>

      <VaccineForm
        kinds={kinds}
        targets={targets}
        today={today}
        initialKind={initialKind}
        initialDogId={sp.dog}
      />
    </>
  );
}
