import { createServerClient } from '@supabase/ssr';
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_KEY } from "./config";

/**
 * サーバー側の Supabase クライアント。
 *
 * 使うのは publishable（anon）キーだけ。
 * service_role キーはこのアプリのどこにも置かない。置いた時点で RLS が意味を失う。
 * データが見えるかどうかは、ログインした本人が app_users 名簿に載っているかで決まる。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component からは Cookie を書けない。
            // middleware がセッションを更新しているので、ここは無視してよい。
          }
        },
      },
    },
  );
}
