'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';
import type { DeliveryMethod } from '@/app/_model/admin';

export type SaveResult =
  | { ok: true; litterId: string; pupCount: number }
  | { ok: false; message: string; duplicate?: boolean };

export type LitterInput = {
  damId: string;
  sireId: string | null;
  birthDate: string;
  gestationDays: number | null;
  method: DeliveryMethod | null;
  male: number;
  female: number;
  stillborn: number;
  note: string;
  /** 同じ母犬・同じ出産日が既にあることを承知のうえで保存する */
  allowDuplicate?: boolean;
};

/**
 * 出産記録の保存。
 *
 * 仔犬検診日・次回交配可能月・ミックス判定は入力させない。
 * すべてDB側で計算する値なので、入力欄を作ると手で書いた値とずれる。
 */
export async function saveLitter(input: LitterInput): Promise<SaveResult> {
  const supabase = await createClient();

  if (!input.damId || !/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) {
    return { ok: false, message: '母犬と出産日を選んでください。' };
  }

  // 同じ母犬・同じ出産日は入力ミスの可能性が高い。
  // DB側にも部分一意索引があるが、先に見つけて理由を説明する。
  if (!input.allowDuplicate) {
    const { data: dup } = await supabase
      .from('litters')
      .select('id')
      .eq('dam_id', input.damId)
      .eq('birth_date', input.birthDate)
      .is('deleted_at', null)
      .maybeSingle();
    if (dup) {
      return {
        ok: false,
        duplicate: true,
        message: 'この母犬には同じ出産日の記録がすでにあります。',
      };
    }
  }

  const { data, error } = await supabase
    .from('litters')
    .insert({
      dam_id: input.damId,
      sire_id: input.sireId,
      birth_date: input.birthDate,
      gestation_days: input.gestationDays,
      method: input.method,
      male_count: input.male,
      female_count: input.female,
      stillborn_count: input.stillborn,
      note: input.note.trim() || null,
    })
    .select('id')
    .single();

  if (error) {
    // 部分一意索引に当たった場合（allowDuplicate でも通らない）
    if (error.code === '23505' || error.message.includes('litters_dam_birth_uniq')) {
      return {
        ok: false,
        duplicate: true,
        message: '同じ母犬・同じ出産日の記録は1件までです。既存の記録を編集してください。',
      };
    }
    return { ok: false, message: `保存できませんでした: ${error.message}` };
  }

  revalidatePath('/admin');
  revalidatePath(`/admin/dogs/${input.damId}`);

  return { ok: true, litterId: data.id, pupCount: input.male + input.female };
}

/**
 * 産まれた仔犬を下書きで作る。
 *
 * 名前は「クッキー ④ ♂1」のような仮名。あとから変えられる。
 * 現場では生まれた直後に個体名を決めないことが多いので、
 * 先に頭数ぶんの器を作っておき、判別できたら名前を付ける運用にする。
 */
export async function createPuppies(litterId: string): Promise<SaveResult> {
  const supabase = await createClient();

  const { data: litter, error: le } = await supabase
    .from('litters')
    .select('id, dam_id, sire_id, birth_date, male_count, female_count')
    .eq('id', litterId)
    .is('deleted_at', null)
    .single();
  if (le || !litter) return { ok: false, message: '出産記録が見つかりませんでした。' };

  const { data: dam } = await supabase
    .from('dogs')
    .select('name, breed_code')
    .eq('id', litter.dam_id)
    .single();
  if (!dam) return { ok: false, message: '母犬が見つかりませんでした。' };

  // 何回目の出産かを数え、仮名に使う
  const { count } = await supabase
    .from('litters')
    .select('id', { count: 'exact', head: true })
    .eq('dam_id', litter.dam_id)
    .is('deleted_at', null)
    .lte('birth_date', litter.birth_date);
  const nth = count ?? 1;

  const rows: {
    breed_code: string;
    sex: string;
    name: string;
    birthday: string;
    dam_id: string;
    sire_id: string | null;
    litter_id: string;
    acquired_on: string;
    status: '在舎';
    is_self_bred: boolean;
  }[] = [];

  const push = (sex: '♂' | '♀', n: number) => {
    for (let i = 1; i <= n; i++) {
      rows.push({
        breed_code: dam.breed_code,
        sex,
        name: `${dam.name} ${circled(nth)} ${sex}${i}`,
        birthday: litter.birth_date,
        dam_id: litter.dam_id,
        sire_id: litter.sire_id,
        litter_id: litter.id,
        // 【法令】自家繁殖なので所有日は誕生日
        acquired_on: litter.birth_date,
        status: '在舎',
        is_self_bred: true,
      });
    }
  };
  push('♂', litter.male_count);
  push('♀', litter.female_count);

  if (rows.length === 0) return { ok: true, litterId, pupCount: 0 };

  const { error } = await supabase.from('dogs').insert(rows);
  if (error) return { ok: false, message: `仔犬を作れませんでした: ${error.message}` };

  revalidatePath('/admin/puppies');
  revalidatePath(`/admin/dogs/${litter.dam_id}`);
  return { ok: true, litterId, pupCount: rows.length };
}

/**
 * 直前の登録を取り消す。
 *
 * 確認ダイアログを挟まず「取り消せる」設計にしている。
 * 保存のたびに確認を出すより、そのほうが速い。
 * 【法令】5年保存があるため物理削除はしない。deleted_at を立てるだけ。
 */
export async function undoLitter(litterId: string): Promise<SaveResult> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 下書き生成した仔犬も一緒に取り消す。孤児を残さない。
  const { error: pe } = await supabase
    .from('dogs')
    .update({ deleted_at: now })
    .eq('litter_id', litterId)
    .is('deleted_at', null);
  if (pe) return { ok: false, message: `取り消せませんでした: ${pe.message}` };

  const { data, error } = await supabase
    .from('litters')
    .update({ deleted_at: now })
    .eq('id', litterId)
    .select('dam_id')
    .single();
  if (error) return { ok: false, message: `取り消せませんでした: ${error.message}` };

  revalidatePath('/admin');
  revalidatePath('/admin/puppies');
  if (data?.dam_id) revalidatePath(`/admin/dogs/${data.dam_id}`);
  return { ok: true, litterId, pupCount: 0 };
}

const CIRCLED = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
const circled = (n: number) => CIRCLED[n] ?? `(${n})`;
