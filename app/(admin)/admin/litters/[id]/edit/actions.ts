'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';
import { todayJst } from '@/app/_lib/admFormat';
import {
  validateLitter,
  type LitterEditInput,
  type LitterRemoveResult,
  type LitterSaveResult,
} from './shared';

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * 出産記録を書き換える。
 *
 * いちばん多い直しは出産日の打ち間違い。
 * 出産日はこの記録だけの値ではなく、
 *   ・仔犬の誕生日（＝法令上の所有日）
 *   ・仔犬検診日（DBが出産日+49日で自動計算）
 *   ・次回交配可能月（最終出産日+5ヶ月）
 * の元になっている。ここを直したら仔犬の誕生日も一緒に直さないと、
 * 帳簿の「生年月日」と出産の記録が食い違う。
 *
 * ただし全頭を上書きはしない。個体ごとに誕生日を直した子（たとえば
 * 日をまたいで生まれた子）まで塗り潰してしまうため、
 * 「誕生日が旧・出産日のままの子」だけを新しい日付に揃える。
 */
export async function saveLitterEdit(
  litterId: string,
  input: LitterEditInput,
): Promise<LitterSaveResult> {
  if (!UUID.test(litterId)) return { ok: false, message: '対象の出産記録が特定できませんでした。' };

  const bad = validateLitter(input, todayJst());
  if (bad) return { ok: false, message: bad.message };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: litter } = await supabase
    .from('litters')
    .select('id, dam_id, birth_date, male_count, female_count')
    .eq('id', litterId)
    .is('deleted_at', null)
    .maybeSingle();
  if (!litter) return { ok: false, message: '出産記録が見つかりませんでした。' };

  // この腹の仔犬。1頭でも登録済みなら♂♀の数は画面から変えさせない
  const { data: pups } = await supabase
    .from('dogs')
    .select('id, birthday, is_self_bred, is_published')
    .eq('litter_id', litterId)
    .is('deleted_at', null);
  const pupList = pups ?? [];

  if (pupList.length > 0 && (input.male !== litter.male_count || input.female !== litter.female_count)) {
    return {
      ok: false,
      message:
        '仔犬を登録済みなので♂♀の数はここでは変えられません。仔犬の追加・取り消しをすると数も一緒に直ります。',
    };
  }

  // 同じ母犬・同じ出産日は1件まで（DBに部分一意索引がある）。
  // 先に見つけて、どの記録とぶつかったかを画面に返す。
  if (input.birthDate !== litter.birth_date) {
    const { data: dup } = await supabase
      .from('litters')
      .select('id')
      .eq('dam_id', litter.dam_id)
      .eq('birth_date', input.birthDate)
      .neq('id', litterId)
      .is('deleted_at', null)
      .maybeSingle();
    if (dup) {
      return {
        ok: false,
        conflictLitterId: dup.id,
        message: 'この母犬には、その日の出産記録がすでにあります。',
      };
    }
  }

  const { error } = await supabase
    .from('litters')
    .update({
      birth_date: input.birthDate,
      sire_id: input.sireId || null,
      gestation_days: input.gestationDays,
      method: input.method,
      male_count: input.male,
      female_count: input.female,
      stillborn_count: input.stillborn,
      note: input.note.trim() || null,
      updated_by: auth.user?.id ?? null,
    })
    .eq('id', litterId)
    .is('deleted_at', null);

  if (error) {
    if (error.code === '23505' || error.message.includes('litters_dam_birth_uniq')) {
      return { ok: false, message: 'この母犬には、その日の出産記録がすでにあります。' };
    }
    if (error.code === '23514') {
      return { ok: false, message: `入力がDBの制限に合いませんでした: ${error.message}` };
    }
    return { ok: false, message: `保存できませんでした: ${error.message}` };
  }

  // 父を変えたら、この腹の仔犬の父も揃える。血統がねじれるため。
  if (pupList.length > 0) {
    await supabase
      .from('dogs')
      .update({ sire_id: input.sireId || null })
      .eq('litter_id', litterId)
      .is('deleted_at', null);
  }

  /* ── 出産日を変えたときだけ、仔犬の誕生日と所有日を追従させる ── */
  let moved: { id: string; is_published: boolean }[] = [];

  if (input.birthDate !== litter.birth_date) {
    const targets = pupList.filter((p) => p.birthday === litter.birth_date);

    if (targets.length > 0) {
      const ids = targets.map((p) => p.id);

      const { error: be } = await supabase
        .from('dogs')
        .update({ birthday: input.birthDate, updated_by: auth.user?.id ?? null })
        .in('id', ids);

      if (be) {
        // 仔犬を直せないまま出産記録だけ動かすと、帳簿と出産の日付が食い違う。
        // 出産記録を元に戻して、やり直してもらう。
        await supabase.from('litters').update({ birth_date: litter.birth_date }).eq('id', litterId);
        return { ok: false, message: `仔犬の誕生日を直せませんでした: ${be.message}` };
      }

      // 【法令】自家繁殖の所有日は誕生日。誕生日を動かしたら所有日も同じ日にする。
      const selfBred = targets.filter((p) => p.is_self_bred).map((p) => p.id);
      if (selfBred.length > 0) {
        const { error: ae } = await supabase
          .from('dogs')
          .update({ acquired_on: input.birthDate })
          .in('id', selfBred);
        if (ae) {
          return {
            ok: false,
            message: `誕生日は直りましたが所有日を直せませんでした: ${ae.message}。もう一度保存してください。`,
          };
        }
      }

      moved = targets.map((p) => ({ id: p.id, is_published: p.is_published }));
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/dogs');
  revalidatePath('/admin/puppies');
  revalidatePath(`/admin/dogs/${litter.dam_id}`);
  revalidatePath(`/admin/litters/${litterId}/edit`);
  for (const p of moved) {
    revalidatePath(`/admin/dogs/${p.id}`);
    if (p.is_published) revalidatePath(`/puppies/${p.id}`);
  }
  if (moved.some((p) => p.is_published)) revalidatePath('/puppies');

  return { ok: true, movedPups: moved.length };
}

/**
 * 出産記録を取り消す。
 *
 * 仔犬を1頭でも登録したあとは取り消させない。
 * 取り消すと仔犬が母不明・腹不明で宙に浮き、帳簿の辻褄が合わなくなる。
 * その場合は先に仔犬側を1頭ずつ取り消してもらう。
 *
 * 【法令】5年保存があるため物理削除はしない。deleted_at を立てるだけ。
 */
export async function removeLitter(litterId: string): Promise<LitterRemoveResult> {
  if (!UUID.test(litterId)) return { ok: false, message: '対象の出産記録が特定できませんでした。' };

  const supabase = await createClient();

  const { data: litter } = await supabase
    .from('litters')
    .select('id, dam_id')
    .eq('id', litterId)
    .is('deleted_at', null)
    .maybeSingle();
  if (!litter) return { ok: false, message: '出産記録が見つかりませんでした。' };

  const { count } = await supabase
    .from('dogs')
    .select('id', { count: 'exact', head: true })
    .eq('litter_id', litterId)
    .is('deleted_at', null);

  if ((count ?? 0) > 0) {
    return {
      ok: false,
      message: `この出産には仔犬が${count}頭ぶら下がっています。先に仔犬の登録を1頭ずつ取り消してください。`,
    };
  }

  const { error } = await supabase
    .from('litters')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', litterId)
    .is('deleted_at', null);
  if (error) return { ok: false, message: `取り消せませんでした: ${error.message}` };

  revalidatePath('/admin');
  revalidatePath('/admin/dogs');
  revalidatePath('/admin/puppies');
  revalidatePath(`/admin/dogs/${litter.dam_id}`);

  return { ok: true, damId: litter.dam_id };
}
