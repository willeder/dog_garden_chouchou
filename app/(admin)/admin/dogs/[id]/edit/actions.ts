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
import { chipConflict } from './chipConflict';

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

  // 「引渡済」は引渡しの記録と一緒にしか付けさせない。
  // 状態だけ変えると、帳簿の引渡し先・担当者・対面説明が空のまま残る。
  if (input.status === '引渡済') {
    const { data: cur } = await supabase.from('dogs').select('status').eq('id', id).maybeSingle();
    if (cur && cur.status !== '引渡済') {
      return {
        ok: false,
        message: '「引渡済」にするときは、カルテの「引渡しを記録する」から引渡し先などを入れてください。',
        field: 'status',
      };
    }
  }

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
    const conflict = await chipConflict(supabase, error, chip);
    if (conflict) return conflict;
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

/** 仔犬から親犬に上げられる状態。引渡済・死亡の子は上げない */
const PROMOTABLE = ['在舎', '商談中', '売約'] as const;

/**
 * 仔犬を親犬（在籍）にする。
 *
 * 自家繁殖の子を繁殖に残すときの操作。編集画面で状態を「在籍」に変えるのと
 * 同じだが、現場では「この子を残す」と決めた瞬間に1回で済ませたい。
 * サイトに出ている子は公開を止める（公開ビューは販売中の状態しか出さないので、
 * スイッチだけ残ると「公開なのに出ない」になる）。
 */
export async function promoteToParent(id: string): Promise<SaveDogResult> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { ok: false, message: '対象の犬が特定できませんでした。' };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: dog } = await supabase
    .from('dogs')
    .select('id, name, status, is_external')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (!dog) return { ok: false, message: '対象の犬が見つかりませんでした。' };
  if (dog.is_external) return { ok: false, message: '外交配の種雄犬は親犬にできません。' };
  if (!(PROMOTABLE as readonly string[]).includes(dog.status)) {
    return {
      ok: false,
      message:
        dog.status === '在籍'
          ? `${dog.name} はすでに親犬（在籍）です。`
          : `状態が「${dog.status}」の犬は親犬にできません。`,
    };
  }

  const { error } = await supabase
    .from('dogs')
    .update({ status: '在籍', is_published: false, updated_by: auth.user?.id ?? null })
    .eq('id', id)
    .is('deleted_at', null);
  if (error) return { ok: false, message: `変更できませんでした: ${error.message}` };

  revalidatePath('/admin');
  revalidatePath('/admin/dogs');
  revalidatePath('/admin/puppies');
  revalidatePath(`/admin/dogs/${id}`);
  revalidatePath('/admin/litters/new');
  revalidatePath('/puppies');
  revalidatePath(`/puppies/${id}`);

  return { ok: true, id };
}
