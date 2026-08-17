import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SUPABASE_URL, SUPABASE_KEY } from "./config";

/**
 * セッションを更新しつつ、未ログインを /login へ送る。
 *
 * 適用範囲は middleware.ts の matcher で /admin と /login に絞ってある。
 * 公開サイトには通さない。
 *
 * 注意: ここでのチェックは「ログインしているか」までしか見ない。
 * 「見てよい人か」の判定は Supabase 側の RLS（app_users 名簿）が担う。
 * 画面側のチェックだけに頼ると、APIを直接叩かれた時に守れない。
 */
export async function updateSession(request: NextRequest) {
  // 環境変数が無いときは Supabase を呼ばずに素通りさせる。
  // ここで例外を投げると原因の分からない 500 になる。
  // 接続できていないので情報は出ない。画面側（admin/layout.tsx）が
  // 何を設定すればよいかを表示する。
  if (!isSupabaseConfigured) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() は Cookie の中身を鵜呑みにせず Supabase に問い合わせて検証する。
  // getSession() は検証しないので middleware では使わない。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  if (!user && path.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
