/**
 * Supabase の接続設定が無いときに出す画面。
 *
 * 何も出さずに 500 で止まると、原因の切り分けに時間がかかる。
 * 「どの変数が足りないか」と「どこに書くか」をそのまま出す。
 */
export function SetupRequired({ missing }: { missing: string[] }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-10">
      <h1 className="text-[19px] font-bold">接続設定がありません</h1>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-adm-muted">
        管理アプリは Supabase に接続して動きます。次の環境変数が読み込めていないため、
        データを表示できません。
      </p>

      <ul className="mt-4 overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
        {missing.map((k) => (
          <li
            key={k}
            className="num border-b border-adm-rule px-3.5 py-2.5 text-[12.5px] text-adm-danger last:border-b-0"
          >
            {k}
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl border border-adm-rule bg-adm-hint p-3.5">
        <p className="text-[12.5px] font-bold">直し方</p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-adm-muted">
          プロジェクト直下の <span className="num">.env.local</span> に以下を書き、
          開発サーバーを再起動してください。
          <span className="num">.env.local</span> は Git に含まれないので、
          Vercel では環境変数の設定画面に同じ2つを登録します。
        </p>
        <pre className="num mt-2.5 overflow-x-auto rounded-lg border border-adm-rule bg-adm-surface p-3 text-[11px] leading-relaxed">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx`}
        </pre>
        <p className="mt-2.5 text-[11.5px] leading-relaxed text-adm-muted">
          値は Supabase の Project Settings → API Keys から取得できます。
          <b className="text-adm-ink">
            service_role キーは絶対に書かないでください。
          </b>
          <span className="num"> NEXT_PUBLIC_ </span>
          が付いた変数はブラウザに配信されるため、書いた時点で全データが読める鍵が公開されます。
        </p>
      </div>

      <p className="mt-4 text-[11.5px] text-adm-muted">
        公開サイト（トップや仔犬紹介）は、この設定が無くても表示されます。
      </p>
    </main>
  );
}
