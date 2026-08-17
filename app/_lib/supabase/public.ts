import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_KEY, isSupabaseConfigured } from "./config";

/**
 * 公開ページ用の Supabase クライアント。
 *
 * Cookie もセッションも持たない、ただの匿名読み取り専用。
 * 匿名キーでは dogs / dog_photos / litters に一切アクセスできず、
 * 読めるのは v_public_puppies と表示用マスタだけ。
 *
 * 管理アプリ側（app/_lib/supabase/server.ts）とは別物なので混ぜないこと。
 */

export { isSupabaseConfigured };

export const publicClient = createClient(
  SUPABASE_URL || "http://localhost",
  SUPABASE_KEY || "missing",
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
);
