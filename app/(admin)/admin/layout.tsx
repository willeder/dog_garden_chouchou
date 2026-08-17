import { redirect } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/server';
import { isSupabaseConfigured, missingSupabaseEnv } from '@/app/_lib/supabase/config';
import { SetupRequired } from '@/app/(admin)/_components/SetupRequired';
import { TabBar } from '@/app/(admin)/_components/TabBar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 環境変数が無いまま Supabase を呼ぶと 500 になり原因が分からない。
  // 何を設定すればよいかを画面に出す。
  if (!isSupabaseConfigured) return <SetupRequired missing={missingSupabaseEnv()} />;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 名簿に載っているか。RLS でも守られているが、
  // 「データが1件も無い」ではなく理由を出したいので画面側でも確認する。
  const { data: staff } = await supabase
    .from('app_users')
    .select('display_name, is_active')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!staff?.is_active) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
        <h1 className="text-[18px] font-bold">このアカウントは利用できません</h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-adm-muted">
          <span className="num">{user.email}</span> は利用者名簿に登録されていません。
          管理者にご連絡ください。
        </p>
        <form action="/auth/signout" method="post" className="mt-6">
          <button className="tap w-full rounded-xl border border-adm-rule bg-adm-surface px-4 py-3 text-[14px]">
            ログアウト
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-2xl pb-[calc(58px+env(safe-area-inset-bottom))]">
      {children}
      <TabBar />
    </div>
  );
}
