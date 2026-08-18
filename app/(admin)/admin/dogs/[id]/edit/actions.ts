'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';
import {
  normalizeChip,
  parseDecimal,
  parseGenes,
  selfBredAcquiredOn,
  validateDog,
  type DogEditInput,
  type SaveDogResult,
} from './shared';

/**
 * 犬の内容を書き換える。
 *
 * 【法令】物理削除はしない。状態を「死亡」にしても行は残す（帳簿は5年保存）。
 * 犬種は変えられないようにしている。犬種を変えると血統・ミックス判定・
 * 公開ページの説明文まで意味が変わるため、間違い登録は作り直しで直す。
 */
export async function saveDog(id: string, input: DogEditInput): Promise<SaveDogResult> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, message: '対象の犬が特定できませんでした。' };

  const bad = validateDog(input);
  if (bad) return { ok: false, message: bad.message, field: bad.field };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const chip = normalizeChip(input.microchip);
  const weight = parseDecimal(input.weight_kg);
  const acquired = selfBredAcquiredOn(input);

  const patch = {
    name: input.name.trim(),
    sex: input.sex,
    birthday: input.birthday || null,
    color_code: input.color_code || null,
    coat_type_code: input.coat_type_code || null,
    ribbon_code: input.ribbon_code || null,
    weight_kg: weight,
    microchip: chip || null,
    genes: parseGenes(input.genes),
    status: input.status,
    died_on: input.died_on || null,
    death_cause: input.death_cause.trim() || null,
    is_self_bred: input.is_self_bred,
    // 自家繁殖に切り替えたら、仕入れ先の情報は残さない（帳簿の記載が矛盾する）
    breeder_id: input.is_self_bred ? null : input.breeder_id || null,
    supplier_id: input.is_self_bred ? null : input.supplier_id || null,
    acquired_on: acquired || null,
    note: input.note.trim() || null,
    updated_by: auth.user?.id ?? null,
  };

  const { data, error } = await supabase
    .from('dogs')
    .update(patch)
    .eq('id', id)
    .is('deleted_at', null)
    .select('id, dam_id, is_published')
    .maybeSingle();

  if (error) {
    // マイクロチップは全頭で重複できない。どの犬が持っているかを出す
    if (error.code === '23505' && error.message.includes('microchip')) {
      const { data: owner } = await supabase
        .from('dogs')
        .select('name')
        .eq('microchip', chip)
        .is('deleted_at', null)
        .maybeSingle();
      return {
        ok: false,
        field: 'microchip',
        message: owner
          ? `このマイクロチップ番号は「${owner.name}」に登録されています。読み取り直して確認してください。`
          : 'このマイクロチップ番号はほかの犬に登録されています。',
      };
    }
    return { ok: false, message: `保存できませんでした: ${error.message}` };
  }
  if (!data) return { ok: false, message: '対象の犬が見つかりませんでした。' };

  revalidatePath('/admin');
  revalidatePath('/admin/dogs');
  revalidatePath('/admin/puppies');
  revalidatePath(`/admin/dogs/${id}`);
  // サイトに出ている子は公開ページも作り直す
  if (data.is_published) {
    revalidatePath('/puppies');
    revalidatePath(`/puppies/${id}`);
  }

  return { ok: true };
}
