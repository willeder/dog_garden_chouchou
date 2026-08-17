import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/app/_lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // オープンリダイレクト防止。外部URLへは飛ばさない。
      const safe = next.startsWith('/') && !next.startsWith('//') ? next : '/admin';
      return NextResponse.redirect(`${origin}${safe}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=1`);
}
