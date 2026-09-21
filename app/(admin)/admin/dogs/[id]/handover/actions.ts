'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';
import { parsePrice, validateHandover, type HandoverInput, type HandoverResult } from './shared';

const UUID = /^[0-9a-f-]{36}$/i;
/** 引渡しを記録できる状態。売約前の子でも当日契約・当日引渡しがあるので含める */
const HANDOVER_FROM = ['在舎', '商談中', '売約', '引渡済'];

function revalidateDog(id: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/dogs');
  revalidatePath('/admin/puppies');
  revalidatePath('/admin/more/ledger');
  revalidatePath(`/admin/dogs/${id}`);
  revalidatePath('/puppies');
  revalidatePath(`/puppies/${id}`);
}

/**
 * 引渡しを記録する（または直す）。
 * 保存すると状態が「引渡済」になり、公式サイトからは自動で外れる。
 */
export async function saveHandover(dogId: string, input: HandoverInput): Promise<HandoverResult> {
  if (!UUID.test(dogId)) return { ok: false, message: '対象の犬が特定できませんでした。' };
  const bad = validateHandover(input);
  if (bad) return { ok: false, message: bad };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: dog } = await supabase
    .from('dogs')
    .select('id, status')
    .eq('id', dogId)
    .is('deleted_at', null)
    .maybeSingle();
  if (!dog) return { ok: false, message: '対象の犬が見つかりませんでした。' };
  if (!HANDOVER_FROM.includes(dog.status)) {
    return { ok: false, message: `状態が「${dog.status}」の犬は引渡しを記録できません。` };
  }

  const { data: existing } = await supabase
    .from('sales')
    .select('id, customer_id')
    .eq('dog_id', dogId)
    .is('deleted_at', null)
    .maybeSingle();

  const customer = {
    name: input.customer_name.trim(),
    phone: input.customer_phone.trim() || null,
    address: input.customer_address.trim() || null,
  };

  // お客様。直すときは同じ行を書き換える
  let customerId = existing?.customer_id ?? null;
  if (customerId) {
    const { error } = await supabase.from('customers').update(customer).eq('id', customerId);
    if (error) return { ok: false, message: `引渡し先を保存できませんでした: ${error.message}` };
  } else {
    const { data: c, error } = await supabase.from('customers').insert(customer).select('id').single();
    if (error || !c) return { ok: false, message: `引渡し先を保存できませんでした: ${error?.message ?? ''}` };
    customerId = c.id;
  }

  const sale = {
    dog_id: dogId,
    customer_id: customerId,
    price: parsePrice(input.price),
    handover_date: input.handover_date,
    staff_name: input.staff_name.trim(),
    explained_in_person: input.explained_in_person,
    explained_on: input.explained_in_person ? input.explained_on : null,
    compliance_checked: input.compliance_checked,
    note: input.note.trim() || null,
    updated_by: auth.user?.id ?? null,
  };

  const { error: se } = existing
    ? await supabase.from('sales').update(sale).eq('id', existing.id)
    : await supabase.from('sales').insert(sale);
  if (se) {
    // 新しく作ったお客様だけ片付ける
    if (!existing) await supabase.from('customers').update({ deleted_at: new Date().toISOString() }).eq('id', customerId);
    return { ok: false, message: `引渡しを保存できませんでした: ${se.message}` };
  }

  if (dog.status !== '引渡済') {
    const { error: de } = await supabase
      .from('dogs')
      .update({ status: '引渡済', is_published: false, updated_by: auth.user?.id ?? null })
      .eq('id', dogId);
    if (de) return { ok: false, message: `引渡しは保存しましたが、状態を「引渡済」にできませんでした: ${de.message}` };
  }

  revalidateDog(dogId);
  return { ok: true };
}

/**
 * 間違えて記録した引渡しを取り消す。状態は「売約」に戻す。
 * 【法令】帳簿は5年保存のため物理削除はしない。
 */
export async function cancelHandover(dogId: string): Promise<HandoverResult> {
  if (!UUID.test(dogId)) return { ok: false, message: '対象の犬が特定できませんでした。' };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('sales')
    .update({ deleted_at: now, updated_by: auth.user?.id ?? null })
    .eq('dog_id', dogId)
    .is('deleted_at', null);
  if (error) return { ok: false, message: `取り消せませんでした: ${error.message}` };

  const { error: de } = await supabase
    .from('dogs')
    .update({ status: '売約', updated_by: auth.user?.id ?? null })
    .eq('id', dogId)
    .eq('status', '引渡済');
  if (de) return { ok: false, message: `記録は取り消しましたが、状態を戻せませんでした: ${de.message}` };

  revalidateDog(dogId);
  return { ok: true };
}
