import Link from 'next/link';
import { safeFrom } from '@/app/_lib/adminNav';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/server';
import { todayJst } from '@/app/_lib/admFormat';
import { HandoverForm } from './HandoverForm';
import type { HandoverInput } from './shared';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string }> };

type SaleRow = {
  price: number | null;
  handover_date: string | null;
  staff_name: string | null;
  explained_in_person: boolean;
  explained_on: string | null;
  compliance_checked: boolean;
  note: string | null;
  customers: { name: string; phone: string | null; address: string | null } | null;
};

export default async function HandoverPage({ params, searchParams }: Props) {
  const { id } = await params;
  const from = safeFrom((await searchParams).from);
  const supabase = await createClient();

  const { data: dogRaw } = await supabase
    .from('dogs')
    .select('id, name, sex, status, list_price, breeds ( name )')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (!dogRaw) notFound();
  const dog = dogRaw as unknown as {
    id: string;
    name: string;
    sex: string;
    status: string;
    list_price: number | null;
    breeds: { name: string } | null;
  };

  const [{ data: saleRaw }, { data: lastStaff }] = await Promise.all([
    supabase
      .from('sales')
      .select(
        'price, handover_date, staff_name, explained_in_person, explained_on, compliance_checked, note, customers ( name, phone, address )',
      )
      .eq('dog_id', id)
      .is('deleted_at', null)
      .maybeSingle(),
    // 担当者名は毎回同じ人が多い。直近の記録を初期値にする
    supabase
      .from('sales')
      .select('staff_name')
      .is('deleted_at', null)
      .not('staff_name', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const sale = saleRaw as unknown as SaleRow | null;
  const today = todayJst();

  const initial: HandoverInput = sale
    ? {
        handover_date: sale.handover_date ?? today,
        customer_name: sale.customers?.name ?? '',
        customer_phone: sale.customers?.phone ?? '',
        customer_address: sale.customers?.address ?? '',
        price: sale.price === null ? '' : String(sale.price),
        staff_name: sale.staff_name ?? '',
        explained_in_person: sale.explained_in_person,
        explained_on: sale.explained_on ?? '',
        compliance_checked: sale.compliance_checked,
        note: sale.note ?? '',
      }
    : {
        handover_date: today,
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        price: dog.list_price === null ? '' : String(dog.list_price),
        staff_name: (lastStaff as { staff_name: string } | null)?.staff_name ?? '',
        explained_in_person: true,
        explained_on: today,
        compliance_checked: false,
        note: '',
      };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-adm-rule bg-adm-surface px-3 pb-2.5 pt-3">
        <Link
          href={from ?? `/admin/dogs/${id}`}
          aria-label="やめて戻る"
          className="tap flex w-[38px] items-center justify-center rounded-lg border border-adm-rule text-[15px] text-adm-muted"
        >
          ‹
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-bold tracking-tight">
            {sale ? '引渡しの記録を直す' : '引渡しを記録'}
          </h1>
          <p className="truncate text-[11.5px] text-adm-muted">
            {dog.name}　{dog.breeds?.name ?? ''} {dog.sex}　いまの状態: {dog.status}
          </p>
        </div>
      </header>

      <HandoverForm dogId={id} initial={initial} isEdit={Boolean(sale)} returnTo={from ?? undefined} />
    </>
  );
}
