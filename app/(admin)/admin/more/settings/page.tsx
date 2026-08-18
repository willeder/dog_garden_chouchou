import Link from 'next/link';
import { createClient } from '@/app/_lib/supabase/server';
import { BreedSettings, VaccineSettings, type BreedRow, type VaccineRow } from './SettingsForms';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: vaccines }, { data: breeds }, { data: me }] = await Promise.all([
    supabase.from('vaccine_schedules').select('kind, interval_months, note').order('kind'),
    supabase.from('breeds').select('code, name, hex, explanation').order('code'),
    // app_users は「自分の行だけ読める」ようにしてある。他人の情報はアプリからは見えない。
    supabase
      .from('app_users')
      .select('display_name, email, is_active, created_at')
      .eq('user_id', user?.id ?? '')
      .maybeSingle(),
  ]);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-adm-rule bg-adm-surface px-3 pb-2.5 pt-3">
        <Link
          href="/admin/more"
          aria-label="戻る"
          className="tap flex w-[38px] items-center justify-center rounded-lg border border-adm-rule text-[15px] text-adm-muted"
        >
          ‹
        </Link>
        <h1 className="text-[17px] font-bold tracking-tight">設定</h1>
      </header>

      <VaccineSettings rows={(vaccines ?? []) as VaccineRow[]} />
      <BreedSettings rows={(breeds ?? []) as BreedRow[]} />

      <section className="px-4 pt-3.5">
        <h2 className="mb-2 text-[13px] font-bold tracking-wide">ログイン中のアカウント</h2>
        <dl className="overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
          <Kv k="表示名" v={me?.display_name ?? '—'} />
          <Kv k="メール" v={me?.email ?? user?.email ?? '—'} mono />
          <Kv k="状態" v={me?.is_active ? '利用できます' : '停止中'} />
        </dl>
        <p className="mt-2 rounded-xl border border-adm-rule bg-adm-hint px-3 py-2.5 text-[11.5px] leading-relaxed text-adm-muted">
          <b className="text-adm-ink">利用者の追加・削除はこの画面からはできません。</b>
          誰がログインできるかは台帳全体の見え方を決める設定なので、
          アプリ側から変えられないようにしてあります。増やすときは開発側にご連絡ください。
        </p>
      </section>

      <div className="h-8" />
    </>
  );
}

function Kv({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-adm-rule px-3.5 py-2.5 last:border-b-0">
      <dt className="shrink-0 text-[13px] text-adm-muted">{k}</dt>
      <dd className={`break-all text-right text-[13px] ${mono ? 'num' : ''}`}>{v}</dd>
    </div>
  );
}
