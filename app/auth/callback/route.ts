import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/app/_lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=nocode`);
  }

  {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // オープンリダイレクト防止。外部URLへは飛ばさない。
      const safe = next.startsWith('/') && !next.startsWith('//') ? next : '/admin';
      return NextResponse.redirect(`${origin}${safe}`);
    }
  }

  // よくある原因は「リンクの有効期限切れ」と「一度使ったリンクの再利用」。
  // 理由を渡してログイン画面で説明する。
  return NextResponse.redirect(`${origin}/login?error=exchange`);
}
