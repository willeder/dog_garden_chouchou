'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';

type R = { ok: true } | { ok: false; message: string };
const UUID = /^[0-9a-f-]{36}$/i;

function revalidate(dogId: string) {
  revalidatePath('/admin');
  revalidatePath(`/admin/dogs/${dogId}`);
  revalidatePath('/admin/vaccinations/new');
}

/**
 * 接種記録の打ち間違いを直す。
 * 次回予定（v_vaccine_due）は記録から計算しているので、直せば予定も直る。
 */
export async function updateVaccination(
  id: string,
  input: { kind: string; dosed_on: string; note: string },
): Promise<R> {
  if (!UUID.test(id)) return { ok: false, message: '対象の記録が特定できませんでした。' };
  if (!input.kind.trim()) return { ok: false, message: '種類を選んでください。' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dosed_on)) return { ok: false, message: '接種日を入れてください。' };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('vaccinations')
    .update({
      kind: input.kind.trim(),
      dosed_on: input.dosed_on,
      note: input.note.trim() || null,
      updated_by: auth.user?.id ?? null,
    })
    .eq('id', id)
    .select('dog_id')
    .maybeSingle();
  if (error) return { ok: false, message: `保存できませんでした: ${error.message}` };
  if (!data) return { ok: false, message: '記録が見つかりませんでした。' };
  revalidate(data.dog_id);
  return { ok: true };
}

/**
 * 間違えて付けた接種記録を消す。
 * 接種記録は法令の帳簿項目ではないため、行ごと削除する。
 */
export async function deleteVaccination(id: string): Promise<R> {
  if (!UUID.test(id)) return { ok: false, message: '対象の記録が特定できませんでした。' };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vaccinations')
    .delete()
    .eq('id', id)
    .select('dog_id')
    .maybeSingle();
  if (error) return { ok: false, message: `削除できませんでした: ${error.message}` };
  if (!data) return { ok: false, message: '記録が見つかりませんでした。' };
  revalidate(data.dog_id);
  return { ok: true };
}
