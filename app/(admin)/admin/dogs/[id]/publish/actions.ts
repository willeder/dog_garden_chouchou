'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';
import { PUBLIC_BUCKET } from '@/app/_lib/supabase/storage';
import { parseDecimal, parseInteger } from '../edit/shared';
import { PUBLISHABLE_STATUSES, type PublishInput, type PublishResult } from './shared';

/**
 * サイト公開の設定を保存する。
 *
 * 公開の判定はビュー v_public_puppies が持っている（is_published ／ 状態 ／
 * 外部犬でない）。ここで同じ条件を先に確かめるのは、スイッチだけ入って
 * サイトに出ない状態を作らないため。
 * 「公開にしたのに出ない」は原因が見えず、いちばん困る不具合になる。
 */
export async function savePublish(id: string, input: PublishInput): Promise<PublishResult> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, message: '対象の犬が特定できませんでした。' };

  const price = parseInteger(input.list_price);
  if (Number.isNaN(price)) return { ok: false, message: '価格は数字で入れてください。' };
  if (price !== null && (price < 0 || price > 9_999_999)) {
    return { ok: false, message: '価格は0円から9,999,999円の間で入れてください。' };
  }

  const w = parseDecimal(input.expected_weight_kg);
  if (Number.isNaN(w)) return { ok: false, message: '成犬時の予想体重は数字で入れてください。' };
  if (w !== null && (w <= 0 || w > 60)) {
    return { ok: false, message: '成犬時の予想体重は0より大きく60kg以下で入れてください。' };
  }

  const h = parseDecimal(input.expected_height_cm);
  if (Number.isNaN(h)) return { ok: false, message: '成犬時の予想体高は数字で入れてください。' };
  if (h !== null && (h <= 0 || h > 100)) {
    return { ok: false, message: '成犬時の予想体高は0より大きく100cm以下で入れてください。' };
  }

  const supabase = await createClient();

  const { data: dog } = await supabase
    .from('dogs')
    .select('id, name, status, is_external, birthday, color_code')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (!dog) return { ok: false, message: '対象の犬が見つかりませんでした。' };

  if (input.is_published) {
    if (dog.is_external) {
      return { ok: false, message: '外部の種雄犬はサイトに出せません。' };
    }
    if (!(PUBLISHABLE_STATUSES as readonly string[]).includes(dog.status)) {
      return {
        ok: false,
        message: `状態が「${dog.status}」の犬はサイトに出ません。先に状態を「在舎」「商談中」「売約」のいずれかに変えてください。`,
      };
    }
    if (!dog.birthday) {
      return { ok: false, message: '誕生日が入っていません。サイトでは月齢を出すので、先に編集画面で入れてください。' };
    }
    const { count } = await supabase
      .from('dog_photos')
      .select('id', { count: 'exact', head: true })
      .eq('dog_id', id)
      .eq('bucket', PUBLIC_BUCKET);
    if ((count ?? 0) === 0) {
      return {
        ok: false,
        message: '「サイト用」の写真が1枚もありません。写真タブから追加してください。',
      };
    }
  }

  const { data: auth } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('dogs')
    .update({
      is_published: input.is_published,
      list_price: price,
      expected_weight_kg: w,
      expected_height_cm: h,
      public_message: input.public_message.trim() || null,
      updated_by: auth.user?.id ?? null,
    })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) return { ok: false, message: `保存できませんでした: ${error.message}` };

  revalidatePath('/admin/puppies');
  revalidatePath(`/admin/dogs/${id}`);
  // 公開ページはどちらの向きでも作り直す（出す／下げるの両方）
  revalidatePath('/puppies');
  revalidatePath(`/puppies/${id}`);
  revalidatePath('/');

  return { ok: true, published: input.is_published };
}
