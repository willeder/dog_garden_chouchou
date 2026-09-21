'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';

const UUID = /^[0-9a-f-]{36}$/i;
/** カルテから1回で切り替えられる状態。引渡済は引渡しの記録から、死亡・親犬化は編集画面から */
const QUICK_STATUSES = ['在舎', '商談中', '売約'] as const;
type QuickStatus = (typeof QUICK_STATUSES)[number];

export async function setPupStatus(
  dogId: string,
  status: QuickStatus,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!UUID.test(dogId)) return { ok: false, message: '対象の犬が特定できませんでした。' };
  if (!(QUICK_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, message: '状態が正しくありません。' };
  }
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('dogs')
    .update({ status, updated_by: auth.user?.id ?? null })
    .eq('id', dogId)
    .is('deleted_at', null)
    .in('status', QUICK_STATUSES as unknown as string[])
    .select('id, is_published')
    .maybeSingle();
  if (error) return { ok: false, message: `変更できませんでした: ${error.message}` };
  if (!data) return { ok: false, message: 'この犬の状態はここでは変えられません。' };

  revalidatePath('/admin');
  revalidatePath('/admin/puppies');
  revalidatePath(`/admin/dogs/${dogId}`);
  if (data.is_published) {
    revalidatePath('/puppies');
    revalidatePath(`/puppies/${dogId}`);
  }
  return { ok: true };
}
