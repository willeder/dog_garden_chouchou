'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';
import { normalizeChip, parseDecimal } from '@/app/(admin)/admin/dogs/[id]/edit/shared';

export type PupEdit = {
  id: string;
  name: string;
  microchip: string;
  color_code: string;
  ribbon_code: string;
  weight_kg: string;
};

export type PupsResult =
  | { ok: true; saved: number }
  | { ok: false; message: string; dogId?: string };

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * 同じ腹の仔犬の名前・チップ・毛色・紐・体重をまとめて保存する。
 * 1頭ずつ「カルテ → 編集 → 保存」を繰り返さずに済むようにするための画面。
 * 途中で1頭失敗したら、そこで止めてどの子かを返す（それより前の子は保存済み）。
 */
export async function saveLitterPups(litterId: string, rows: PupEdit[]): Promise<PupsResult> {
  if (!UUID.test(litterId)) return { ok: false, message: '対象の出産記録が特定できませんでした。' };

  // 先に全頭を検査する。途中まで保存されてから弾かれるのを減らす
  const chips = new Map<string, string>();
  for (const r of rows) {
    if (!UUID.test(r.id)) return { ok: false, message: '対象の仔犬が特定できませんでした。' };
    const name = r.name.trim();
    if (!name) return { ok: false, message: '名前が空の子がいます。', dogId: r.id };
    if (name.length > 40) return { ok: false, message: `「${name}」は40文字を超えています。`, dogId: r.id };
    const chip = normalizeChip(r.microchip);
    if (chip && chip.length !== 15) {
      return { ok: false, message: `${name} のマイクロチップが${chip.length}桁です（15桁）。`, dogId: r.id };
    }
    if (chip) {
      if (chips.has(chip)) {
        return { ok: false, message: `${chips.get(chip)} と ${name} に同じマイクロチップ番号が入っています。`, dogId: r.id };
      }
      chips.set(chip, name);
    }
    const w = parseDecimal(r.weight_kg);
    if (Number.isNaN(w) || (w !== null && (w <= 0 || w > 60))) {
      return { ok: false, message: `${name} の体重は0より大きく60kg以下の数字で入れてください。`, dogId: r.id };
    }
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  let saved = 0;
  for (const r of rows) {
    const chip = normalizeChip(r.microchip);
    const { error } = await supabase
      .from('dogs')
      .update({
        name: r.name.trim(),
        microchip: chip || null,
        color_code: r.color_code || null,
        ribbon_code: r.ribbon_code || null,
        weight_kg: parseDecimal(r.weight_kg),
        updated_by: auth.user?.id ?? null,
      })
      .eq('id', r.id)
      .eq('litter_id', litterId)
      .is('deleted_at', null);
    if (error) {
      if (error.code === '23505' && error.message.includes('microchip')) {
        const { data: owner } = await supabase
          .from('dogs')
          .select('name')
          .eq('microchip', chip)
          .is('deleted_at', null)
          .maybeSingle();
        return {
          ok: false,
          dogId: r.id,
          message: `${r.name.trim()} のマイクロチップ番号は${owner ? `「${owner.name}」` : 'ほかの犬'}に登録されています。${saved > 0 ? `（それより前の${saved}頭は保存済み）` : ''}`,
        };
      }
      return { ok: false, dogId: r.id, message: `${r.name.trim()} を保存できませんでした: ${error.message}` };
    }
    saved++;
  }

  revalidatePath('/admin/puppies');
  revalidatePath('/admin/dogs');
  revalidatePath('/admin/more/ledger');
  for (const r of rows) revalidatePath(`/admin/dogs/${r.id}`);
  revalidatePath('/puppies');
  return { ok: true, saved };
}
