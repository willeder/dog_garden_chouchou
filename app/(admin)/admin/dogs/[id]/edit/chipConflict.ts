import type { SupabaseClient } from '@supabase/supabase-js';
import type { SaveDogResult } from './shared';

/**
 * マイクロチップの重複（unique 制約 23505）を、現場が直せる文にする。
 * 「どの犬が持っているか」まで出さないと、読取器で読み直すべきか分からない。
 * 編集と新規登録で同じ文を出すためにここにまとめる。
 */
export async function chipConflict(
  supabase: SupabaseClient,
  error: { code?: string; message: string },
  chip: string,
): Promise<SaveDogResult | null> {
  if (error.code !== '23505' || !error.message.includes('microchip')) return null;
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
