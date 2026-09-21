import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/server';
import { ymd } from '@/app/_lib/admFormat';
import { safeFrom } from '@/app/_lib/adminNav';
import { PupsForm, type Opt } from './PupsForm';
import type { PupEdit } from './actions';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string }> };

export default async function LitterPupsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const from = safeFrom((await searchParams).from);
  const supabase = await createClient();

  const { data: litter } = await supabase
    .from('v_litters')
    .select('id, dam_id, dam_name, birth_date')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (!litter) notFound();
  const l = litter as { id: string; dam_id: string; dam_name: string; birth_date: string };

  const [{ data: pups }, { data: colors }, { data: ribbons }] = await Promise.all([
    supabase
      .from('dogs')
      .select('id, name, sex, status, microchip, color_code, ribbon_code, weight_kg')
      .eq('litter_id', id)
      .is('deleted_at', null)
      .order('sex')
      .order('name'),
    supabase.from('coat_colors').select('code, name').order('name'),
    supabase.from('ribbon_colors').select('code, name').order('code'),
  ]);

  type P = {
    id: string;
    name: string;
    sex: string;
    status: string;
    microchip: string | null;
    color_code: string | null;
    ribbon_code: string | null;
    weight_kg: number | null;
  };
  const rows = ((pups ?? []) as P[]).map((p) => ({
    sex: p.sex,
    status: p.status,
    edit: {
      id: p.id,
      name: p.name,
      microchip: p.microchip ?? '',
      color_code: p.color_code ?? '',
      ribbon_code: p.ribbon_code ?? '',
      weight_kg: p.weight_kg === null ? '' : String(p.weight_kg),
    } satisfies PupEdit,
  }));

  const back = from ?? '/admin/puppies';

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-adm-rule bg-adm-surface px-3 pb-2.5 pt-3">
        <Link
          href={back}
          aria-label="やめて戻る"
          className="tap flex w-[38px] items-center justify-center rounded-lg border border-adm-rule text-[15px] text-adm-muted"
        >
          ‹
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-bold tracking-tight">仔犬をまとめて入力</h1>
          <p className="num truncate text-[11.5px] text-adm-muted">
            {l.dam_name}　{ymd(l.birth_date)}　{rows.length}頭　保存を押すまで変わりません
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="mx-4 mt-3.5 rounded-xl border border-adm-rule bg-adm-surface px-3.5 py-3 text-[12.5px] text-adm-muted">
          この出産の仔犬はまだ登録されていません。
        </p>
      ) : (
        <PupsForm
          litterId={id}
          rows={rows}
          colors={(colors ?? []) as Opt[]}
          ribbons={(ribbons ?? []) as Opt[]}
          returnTo={back}
        />
      )}
    </>
  );
}
