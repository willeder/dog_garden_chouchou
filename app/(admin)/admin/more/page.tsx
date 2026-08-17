
const ITEMS = [
  { label: '相手先', note: '仕入れ元・繁殖者' },
  { label: '帳簿', note: '法令13項目・CSV出力' },
  { label: '定期報告', note: '毎年4/1〜5/30提出' },
  { label: '設定', note: '利用者・ワクチン間隔' },
];

export default function MorePage() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-adm-rule bg-adm-surface px-4 pb-2.5 pt-3">
        <h1 className="text-[17px] font-bold tracking-tight">その他</h1>
      </header>

      <ul className="mx-4 mt-3.5 overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
        {ITEMS.map((it) => (
          <li key={it.label} className="flex items-center justify-between gap-3 border-b border-adm-rule px-3.5 py-3 last:border-b-0">
            <span>
              <span className="block text-[14px]">{it.label}</span>
              <span className="block text-[11.5px] text-adm-muted">{it.note}</span>
            </span>
            <span className="text-[11.5px] text-adm-muted">準備中</span>
          </li>
        ))}
      </ul>

      <form action="/auth/signout" method="post" className="mx-4 mt-5">
        <button className="tap w-full rounded-xl border border-adm-rule bg-adm-surface px-4 py-3 text-[14px]">
          ログアウト
        </button>
      </form>
    </>
  );
}
