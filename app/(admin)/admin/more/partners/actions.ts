'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';
import type { PartnerInput, PartnerResult } from './shared';

const UUID = /^[0-9a-f-]{36}$/i;

function clean(v: string): string | null {
  return v.trim() || null;
}

/**
 * 相手先（仕入れ元・繁殖者）の登録と書き換え。
 *
 * 【法令】帳簿には「繁殖者の氏名」と「その登録番号」を書く必要がある。
 * 登録番号はここで持たせ、犬ごとに持たせない。
 * 犬ごとに持つと、同じ業者なのに犬によって番号が違う、という状態が起きる。
 */
export async function savePartner(id: string | null, input: PartnerInput): Promise<PartnerResult> {
  if (id !== null && !UUID.test(id)) return { ok: false, message: '対象が特定できませんでした。' };
  if (!input.name.trim()) return { ok: false, message: '名前を入れてください。', field: 'name' };
  if (input.name.trim().length > 80) return { ok: false, message: '名前は80文字までです。', field: 'name' };

  const supabase = await createClient();

  const patch = {
    name: input.name.trim(),
    contact_name: clean(input.contact_name),
    license_no: clean(input.license_no),
    phone: clean(input.phone),
    note: clean(input.note),
  };

  const q = id
    ? supabase.from('partners').update(patch).eq('id', id).is('deleted_at', null).select('id')
    : supabase.from('partners').insert(patch).select('id');

  const { data, error } = await q.maybeSingle();
  if (error) return { ok: false, message: `保存できませんでした: ${error.message}` };
  if (!data) return { ok: false, message: '対象が見つかりませんでした。' };

  revalidatePath('/admin/more/partners');
  revalidatePath('/admin/more/ledger');
  return { ok: true, id: data.id };
}

/**
 * 相手先を一覧から外す。
 *
 * 【法令】帳簿に載っている相手先は消さない。物理削除もしない。
 * 犬に紐付いている相手先を消すと、その犬の「繁殖者」「入手先」が空になり、
 * 帳簿の項目が欠ける。紐付きがある場合は断る。
 */
export async function removePartner(id: string): Promise<PartnerResult> {
  if (!UUID.test(id)) return { ok: false, message: '対象が特定できませんでした。' };

  const supabase = await createClient();

  const [{ count: asBreeder }, { count: asSupplier }] = await Promise.all([
    supabase
      .from('dogs')
      .select('id', { count: 'exact', head: true })
      .eq('breeder_id', id)
      .is('deleted_at', null),
    supabase
      .from('dogs')
      .select('id', { count: 'exact', head: true })
      .eq('supplier_id', id)
      .is('deleted_at', null),
  ]);

  const used = (asBreeder ?? 0) + (asSupplier ?? 0);
  if (used > 0) {
    return {
      ok: false,
      message: `${used}頭の犬に繁殖者または入手先として登録されています。帳簿の項目が欠けるため外せません。`,
    };
  }

  const { error } = await supabase
    .from('partners')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);
  if (error) return { ok: false, message: `外せませんでした: ${error.message}` };

  revalidatePath('/admin/more/partners');
  return { ok: true, id };
}
