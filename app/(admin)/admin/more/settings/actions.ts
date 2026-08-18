'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';

export type SettingsResult = { ok: true; message: string } | { ok: false; message: string };

/**
 * ワクチンの間隔。
 *
 * 次回接種予定日は「前回接種日＋この月数」で計算され、ホームのアラートに出る。
 * 数字を変えると、過去の記録から計算し直された予定日がすぐ反映される。
 */
export async function saveVaccineInterval(kind: string, months: number): Promise<SettingsResult> {
  if (!kind) return { ok: false, message: '対象が特定できませんでした。' };
  if (!Number.isInteger(months) || months < 1 || months > 60) {
    return { ok: false, message: '間隔は1〜60ヶ月で入れてください。' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('vaccine_schedules')
    .update({ interval_months: months })
    .eq('kind', kind)
    .select('kind')
    .maybeSingle();

  if (error) return { ok: false, message: `保存できませんでした: ${error.message}` };
  if (!data) return { ok: false, message: '対象が見つかりませんでした。' };

  revalidatePath('/admin');
  revalidatePath('/admin/more/settings');
  return { ok: true, message: `${kind}の間隔を${months}ヶ月にしました` };
}

/**
 * 犬種の説明。
 *
 * 公式サイトの子犬詳細ページ「犬種」欄に、犬種名の下の小さい文字で出る。
 * 犬ごとではなく犬種ごとに1つ。仔犬の紹介文は公開設定の画面で入れる。
 */
export async function saveBreedExplanation(code: string, text: string): Promise<SettingsResult> {
  if (!code) return { ok: false, message: '対象が特定できませんでした。' };
  const t = text.trim();
  if (t.length > 200) return { ok: false, message: '説明は200文字までです。' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('breeds')
    .update({ explanation: t || null })
    .eq('code', code)
    .select('code, name')
    .maybeSingle();

  if (error) return { ok: false, message: `保存できませんでした: ${error.message}` };
  if (!data) return { ok: false, message: '対象が見つかりませんでした。' };

  revalidatePath('/admin/more/settings');
  // 公開ページの表示が変わるので作り直す
  revalidatePath('/puppies');
  return { ok: true, message: `${data.name}の説明を保存しました` };
}
