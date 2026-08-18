'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';
import { draftPuppyName } from '../litters/naming';

export type PuppyResult = { ok: true; message: string } | { ok: false; message: string };

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * 腹に仔犬を1頭足す。
 *
 * 出産を記録したあとで頭数が変わることがある。
 *   ・死産だと思っていた子が生きていた
 *   ・頭数を打ち間違えた
 * 出産記録ごと取り消して入れ直すと、記録した日時も父の情報も打ち直しになるので、
 * 1頭だけ足せるようにしている。
 *
 * 出産記録側の♂♀頭数も同時に直す。ここを合わせておかないと、
 * カルテの出産欄（♂2 ♀1）と実際の仔犬の数が食い違い、どちらが正しいか分からなくなる。
 */
export async function addPuppy(litterId: string, sex: '♂' | '♀'): Promise<PuppyResult> {
  if (!UUID.test(litterId)) return { ok: false, message: '対象の出産記録が特定できませんでした。' };
  if (sex !== '♂' && sex !== '♀') return { ok: false, message: '性別が正しくありません。' };

  const supabase = await createClient();

  const { data: litter } = await supabase
    .from('litters')
    .select('id, dam_id, sire_id, birth_date, male_count, female_count')
    .eq('id', litterId)
    .is('deleted_at', null)
    .maybeSingle();
  if (!litter) return { ok: false, message: '出産記録が見つかりませんでした。' };

  const { data: dam } = await supabase
    .from('dogs')
    .select('name, breed_code')
    .eq('id', litter.dam_id)
    .maybeSingle();
  if (!dam) return { ok: false, message: '母犬が見つかりませんでした。' };

  // 何回目の出産か。仮名に使う（一括生成のときと同じ数え方）
  const { count: nthCount } = await supabase
    .from('litters')
    .select('id', { count: 'exact', head: true })
    .eq('dam_id', litter.dam_id)
    .is('deleted_at', null)
    .lte('birth_date', litter.birth_date);

  // この腹の同性が今何頭いるか。連番の続きから付ける
  const { count: sameSex } = await supabase
    .from('dogs')
    .select('id', { count: 'exact', head: true })
    .eq('litter_id', litterId)
    .eq('sex', sex)
    .is('deleted_at', null);

  const { data: created, error } = await supabase
    .from('dogs')
    .insert({
      breed_code: dam.breed_code,
      sex,
      name: draftPuppyName(dam.name, nthCount ?? 1, sex, (sameSex ?? 0) + 1),
      birthday: litter.birth_date,
      dam_id: litter.dam_id,
      sire_id: litter.sire_id,
      litter_id: litter.id,
      // 【法令】自家繁殖なので所有日は誕生日
      acquired_on: litter.birth_date,
      status: '在舎',
      is_self_bred: true,
    })
    .select('id, name')
    .single();

  if (error) return { ok: false, message: `追加できませんでした: ${error.message}` };

  const patch =
    sex === '♂'
      ? { male_count: litter.male_count + 1 }
      : { female_count: litter.female_count + 1 };
  const { error: le } = await supabase.from('litters').update(patch).eq('id', litterId);
  if (le) {
    // 仔犬は作れたが頭数を直せなかった。行を残すと数が食い違うので戻す。
    await supabase.from('dogs').delete().eq('id', created.id);
    return { ok: false, message: `出産記録の頭数を直せませんでした: ${le.message}` };
  }

  revalidateAll(litter.dam_id);
  return { ok: true, message: `${created.name} を追加しました` };
}

/**
 * 仔犬の登録を取り消す。
 *
 * 【法令】5年保存があるため物理削除はしない。deleted_at を立てるだけ。
 * これは「間違えて作った下書きを消す」ためのもの。
 * 亡くなった子は取り消さず、状態を「死亡」にして死亡日を入れること。
 * 取り消すと帳簿からも消えるが、死亡は帳簿に残さなければならない。
 */
export async function removePuppy(dogId: string): Promise<PuppyResult> {
  if (!UUID.test(dogId)) return { ok: false, message: '対象の仔犬が特定できませんでした。' };

  const supabase = await createClient();

  const { data: dog } = await supabase
    .from('dogs')
    .select('id, name, sex, status, litter_id')
    .eq('id', dogId)
    .is('deleted_at', null)
    .maybeSingle();
  if (!dog) return { ok: false, message: '対象の仔犬が見つかりませんでした。' };

  if (dog.status === '死亡') {
    return {
      ok: false,
      message: '死亡した子は取り消せません。死亡の記録は帳簿に5年間残す必要があります。',
    };
  }

  // 引き渡した記録がある子は消さない（帳簿と売買の記録が合わなくなる）
  const { count: sold } = await supabase
    .from('sales')
    .select('id', { count: 'exact', head: true })
    .eq('dog_id', dogId)
    .is('deleted_at', null);
  if ((sold ?? 0) > 0 || dog.status === '引渡済') {
    return { ok: false, message: '引き渡しの記録がある子は取り消せません。' };
  }

  const { error } = await supabase
    .from('dogs')
    .update({ deleted_at: new Date().toISOString(), is_published: false })
    .eq('id', dogId)
    .is('deleted_at', null);
  if (error) return { ok: false, message: `取り消せませんでした: ${error.message}` };

  // 出産記録の頭数も1つ減らす
  let damId: string | null = null;
  if (dog.litter_id) {
    const { data: litter } = await supabase
      .from('litters')
      .select('id, dam_id, male_count, female_count')
      .eq('id', dog.litter_id)
      .is('deleted_at', null)
      .maybeSingle();
    if (litter) {
      damId = litter.dam_id;
      const patch =
        dog.sex === '♂'
          ? { male_count: Math.max(0, litter.male_count - 1) }
          : { female_count: Math.max(0, litter.female_count - 1) };
      await supabase.from('litters').update(patch).eq('id', litter.id);
    }
  }

  revalidateAll(damId);
  revalidatePath(`/admin/dogs/${dogId}`);
  revalidatePath('/puppies');
  revalidatePath(`/puppies/${dogId}`);
  return { ok: true, message: `${dog.name} の登録を取り消しました` };
}

function revalidateAll(damId: string | null) {
  revalidatePath('/admin');
  revalidatePath('/admin/dogs');
  revalidatePath('/admin/puppies');
  if (damId) revalidatePath(`/admin/dogs/${damId}`);
}
