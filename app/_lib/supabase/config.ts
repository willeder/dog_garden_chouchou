/**
 * Supabase の接続設定。
 *
 * 未設定のまま createServerClient を呼ぶと
 * 「Your project's URL and Key are required to create a Supabase client!」で
 * 500 になり、原因が分からないまま止まる。
 * 呼ぶ前にここで判定し、画面に何を設定すればよいかを出す。
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;

/** 未設定の変数名。画面に出して原因を特定できるようにする */
export const missingSupabaseEnv = (): string[] => {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_KEY) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return missing;
};
