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
 */
export const config = {
  matcher: ["/admin/:path*", "/admin", "/login"],
};
