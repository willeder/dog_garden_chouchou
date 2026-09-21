'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/_lib/supabase/server';
import { VIDEO_BUCKET } from '@/app/_lib/supabase/storage';

export type VideoResult = { ok: true } | { ok: false; message: string };

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * 犬の動画を差し替える／外す。
 *
 * ファイル本体はブラウザから直接 Storage に上げる（サーバーを経由すると
 * Vercel の送信サイズ上限にかかるため）。ここでは列の付け替えと、
 * 古いファイルの片付け、サイトの再生成だけを行う。
 *
 * @param path 新しい動画のパス。null なら動画を外す
 */
export async function setDogVideo(dogId: string, path: string | null): Promise<VideoResult> {
  if (!UUID.test(dogId)) return { ok: false, message: '対象の犬が特定できませんでした。' };
  // 他の犬のフォルダのファイルを指させない
  if (path !== null && !path.startsWith(`${dogId}/`)) {
    return { ok: false, message: '動画の保存先が正しくありません。' };
  }

  const supabase = await createClient();

  const { data: dog } = await supabase
    .from('dogs')
    .select('id, video_path')
    .eq('id', dogId)
    .is('deleted_at', null)
    .maybeSingle();
  if (!dog) return { ok: false, message: '対象の犬が見つかりませんでした。' };

  const { error } = await supabase.from('dogs').update({ video_path: path }).eq('id', dogId);
  if (error) return { ok: false, message: `保存できませんでした: ${error.message}` };

  // 前の動画ファイルを消す。失敗してもサイトには出なくなるので致命的ではない
  const old = (dog as { video_path: string | null }).video_path;
  if (old && old !== path) {
    await supabase.storage.from(VIDEO_BUCKET).remove([old]);
  }

  revalidatePath(`/admin/dogs/${dogId}`);
  revalidatePath('/puppies');
  revalidatePath(`/puppies/${dogId}`);
  return { ok: true };
}
