import { type NextRequest } from "next/server";
import { updateSession } from "@/app/_lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * 管理アプリのパスだけを通す。
 *
 * 公開サイト（/, /puppies, /about …）には一切かけない。
 * かけると全ページのリクエストごとに Supabase の認証確認が走り、
 * 表示が遅くなるうえ、公開ページに認証の都合を持ち込むことになる。
 *
 * ただしトップに `?code=` が付いて来たときだけは例外。
 * Supabase は emailRedirectTo が Redirect URLs に登録されていないと、
 * ログインリンクの飛び先を Site URL（＝トップ）に落とす。
 * その状態でも認証を通せるよう、/auth/callback へ引き渡す。
 * `has` を付けているので、通常のトップ表示では middleware は動かない。
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/login",
    { source: "/", has: [{ type: "query", key: "code" }] },
  ],
};
