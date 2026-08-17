'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * 下部固定タブ。4つまで。
 * 5つ以上にすると押し間違えが増えるので増やさないこと。
 */
const TABS = [
  { href: '/admin', label: 'ホーム', icon: HomeIcon, match: (p: string) => p === '/admin' },
  { href: '/admin/dogs', label: '犬', icon: DogIcon, match: (p: string) => p.startsWith('/admin/dogs') },
  { href: '/admin/puppies', label: '仔犬', icon: PawIcon, match: (p: string) => p.startsWith('/admin/puppies') },
  { href: '/admin/more', label: 'その他', icon: MoreIcon, match: (p: string) => p.startsWith('/admin/more') },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-adm-rule bg-adm-surface pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const on = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={on ? 'page' : undefined}
                className={`tap flex flex-col items-center justify-center gap-1 py-2 text-[10.5px] ${
                  on ? 'font-bold text-adm-action' : 'text-adm-muted'
                }`}
              >
                <Icon />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const S = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function HomeIcon() {
  return (
    <svg {...S} aria-hidden>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-5.5h5V20" />
    </svg>
  );
}

function DogIcon() {
  return (
    <svg {...S} aria-hidden>
      <path d="M10 5.5 7 3v4" />
      <path d="M14 5.5 17 3v4" />
      <path d="M5 11a7 7 0 0 1 14 0v4.5A4.5 4.5 0 0 1 14.5 20h-5A4.5 4.5 0 0 1 5 15.5Z" />
      <path d="M10 12h.01M14 12h.01" />
      <path d="M12 15v1.5" />
    </svg>
  );
}

function PawIcon() {
  return (
    <svg {...S} aria-hidden>
      <ellipse cx="7" cy="9" rx="1.9" ry="2.5" />
      <ellipse cx="12" cy="7" rx="1.9" ry="2.5" />
      <ellipse cx="17" cy="9" rx="1.9" ry="2.5" />
      <path d="M12 12.5c3 0 5 2.2 5 4.4S15 21 12 21s-5-1.9-5-4.1 2-4.4 5-4.4Z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg {...S} aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
