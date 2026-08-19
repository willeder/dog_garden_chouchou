'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';
import { todayJst } from '@/app/_lib/admFormat';
import { MAX_AT_ONCE, type VaccineInput, type VaccineResult } from './shared';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f-]{36}$/i;

/**
 * ワクチン接種をまとめて記録する。
 *
 * 現場では同じ日に何頭も打つ。1頭ずつカルテを開いて入れるのは現実的でない。
 * 記録した瞬間に次回予定日が計算し直され、ホームのアラートから消える。
 *
 * 同じ犬・同じ種類・同じ日の記録が既にあれば飛ばす。
 * DB側に重複を止める仕組みが無いので、二度押しでも同じ記録が増えないようにここで見る。
 */
export async function saveVaccinations(input: VaccineInput): Promise<VaccineResult> {
  const kind = input.kind.trim();
  if (!kind) return { ok: false, message: 'ワクチンの種類を選んでください。' };
  if (!DATE_RE.test(input.dosedOn)) return { ok: false, message: '接種日を選んでください。' };

  const ids = [...new Set(input.dogIds)].filter((id) => UUID.test(id));
  if (ids.length === 0) return { ok: false, message: '記録する犬を選んでください。' };
  if (ids.length > MAX_AT_ONCE) {
    return { ok: false, message: `一度に記録できるのは${MAX_AT_ONCE}頭までです。` };
  }

  const supabase = await createClient();

  // 種類はマスタにあるものだけ。手で打った値が混ざると次回予定日が計算されない
  const { data: schedule } = await supabase
    .from('vaccine_schedules')
    .select('kind')
    .eq('kind', kind)
    .maybeSingle();
  if (!schedule) return { ok: false, message: 'ワクチンの種類が正しくありません。' };

  // 未来の日付は受けない。接種は済んだことの記録なので
  if (input.dosedOn > todayJst()) {
    return { ok: false, message: '接種日に未来の日付は入れられません。' };
  }

  // 対象の犬が本当に存在するか（消された犬・外部の犬を除く）
  const { data: dogsRaw } = await supabase
    .from('dogs')
    .select('id')
    .in('id', ids)
    .is('deleted_at', null)
    .eq('is_external', false);
  const valid = new Set(((dogsRaw ?? []) as { id: string }[]).map((d) => d.id));
  const targets = ids.filter((id) => valid.has(id));
  if (targets.length === 0) return { ok: false, message: '記録できる犬がいませんでした。' };

  // すでに同じ日の記録がある犬は飛ばす
  const { data: dupRaw } = await supabase
    .from('vaccinations')
    .select('dog_id')
    .in('dog_id', targets)
    .eq('kind', kind)
    .eq('dosed_on', input.dosedOn);
  const already = new Set(((dupRaw ?? []) as { dog_id: string }[]).map((d) => d.dog_id));
  const toInsert = targets.filter((id) => !already.has(id));

  if (toInsert.length === 0) {
    return { ok: true, inserted: 0, skipped: targets.length };
  }

  const { data: auth } = await supabase.auth.getUser();
  const note = input.note.trim() || null;

  const { error } = await supabase.from('vaccinations').insert(
    toInsert.map((dog_id) => ({
      dog_id,
      kind,
      dosed_on: input.dosedOn,
      note,
      updated_by: auth.user?.id ?? null,
    })),
  );
  if (error) return { ok: false, message: `記録できませんでした: ${error.message}` };

  revalidatePath('/admin');
  revalidatePath('/admin/dogs');
  for (const id of toInsert) revalidatePath(`/admin/dogs/${id}`);

  return { ok: true, inserted: toInsert.length, skipped: already.size };
}
