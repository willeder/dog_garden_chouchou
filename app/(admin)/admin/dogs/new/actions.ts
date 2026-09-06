'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';
import { chipConflict } from '../[id]/edit/chipConflict';
import {
  normalizeChip,
  parseDecimal,
  parseGenes,
  selfBredAcquiredOn,
  validateNewDog,
  type DogNewInput,
  type SaveDogResult,
} from '../[id]/edit/shared';

/**
 * 犬を新しく登録する。
 *
 * 出産記録から生まれる仔犬とは別の入口。使うのは次の2つ。
 *   ・外部から迎えた親犬（仕入れ・譲受）
 *   ・外交配の相手になる他犬舎の種雄犬（is_external）
 *
 * 【法令】仕入れた犬は帳簿の「新たに所有した数」に数えるため、所有日と
 * 繁殖者・入手先を入れる。外交配の種雄犬は自舎の所有ではないので
 * 帳簿・定期報告から外れる（ビュー側で is_external を除外している）。
 */
export async function createDog(input: DogNewInput): Promise<SaveDogResult> {
  const bad = validateNewDog(input);
  if (bad) return { ok: false, message: bad.message, field: bad.field };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  // 犬種はマスタにあるものだけ。手で打った値は受けない
  const { data: breed } = await supabase.from('breeds').select('code').eq('code', input.breed_code).maybeSingle();
  if (!breed) return { ok: false, message: '犬種が見つかりませんでした。選び直してください。' };

  const chip = normalizeChip(input.microchip);
  const weight = parseDecimal(input.weight_kg);
  const external = input.is_external;
  const acquired = external ? '' : selfBredAcquiredOn(input);

  const row = {
    breed_code: input.breed_code,
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
    is_external: external,
    // 外交配の種雄犬に帳簿の項目は付けない（自舎の所有ではない）
    is_self_bred: external ? false : input.is_self_bred,
    breeder_id: external || input.is_self_bred ? null : input.breeder_id || null,
    supplier_id: external || input.is_self_bred ? null : input.supplier_id || null,
    acquired_on: acquired || null,
    note: input.note.trim() || null,
    is_published: false,
    updated_by: auth.user?.id ?? null,
  };

  const { data, error } = await supabase.from('dogs').insert(row).select('id').single();

  if (error) {
    const conflict = await chipConflict(supabase, error, chip);
    if (conflict) return conflict;
    return { ok: false, message: `登録できませんでした: ${error.message}` };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/dogs');
  revalidatePath('/admin/litters/new');

  return { ok: true, id: data.id };
}
