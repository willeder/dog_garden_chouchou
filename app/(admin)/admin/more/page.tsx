import Link from 'next/link';

const ITEMS = [
  { href: '/admin/more/ledger', label: '帳簿', note: '動物愛護管理法の項目・CSV出力' },
  { href: '/admin/more/report', label: '定期報告', note: '毎年4/1〜5/30に提出' },
  { href: '/admin/more/partners', label: '相手先', note: '仕入れ元・繁殖者' },
  { href: '/admin/more/settings', label: '設定', note: 'ワクチン間隔・犬種の説明' },
];

export default function MorePage() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-adm-rule bg-adm-surface px-4 pb-2.5 pt-3">
        <h1 className="text-[17px] font-bold tracking-tight">その他</h1>
      </header>

      <ul className="mx-4 mt-3.5 overflow-hidden rounded-xl border border-adm-rule bg-adm-surface">
        {ITEMS.map((it) => (
          <li key={it.href} className="border-b border-adm-rule last:border-b-0">
            <Link
              href={it.href}
              className="tap flex items-center justify-between gap-3 px-3.5 py-3 active:bg-adm-paper"
            >
              <span className="min-w-0">
                <span className="block text-[14px] font-medium">{it.label}</span>
                <span className="block text-[11.5px] text-adm-muted">{it.note}</span>
              </span>
              <span className="shrink-0 text-[15px] text-adm-muted">›</span>
            </Link>
          </li>
        ))}
      </ul>

      <form action="/auth/signout" method="post" className="mx-4 mt-5">
        <button className="tap w-full rounded-xl border border-adm-rule bg-adm-surface px-4 py-3 text-[14px]">
          ログアウト
        </button>
      </form>

      <div className="h-6" />
    </>
  );
}
