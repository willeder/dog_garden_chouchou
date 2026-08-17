'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * 名前とマイクロチップの検索。
 * 打つたびに全件取り直すと現場の回線で待たされるので、入力が止まってから投げる。
 */
export function SearchBox({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const current = params.get('q') ?? '';
    if (value === current) return;

    const id = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set('q', value.trim());
      else next.delete('q');
      startTransition(() => {
        router.replace(`/admin/dogs${next.size ? `?${next}` : ''}`, { scroll: false });
      });
    }, 250);

    return () => clearTimeout(id);
  }, [value, params, router]);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-adm-rule bg-adm-surface px-3">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A6A9A4" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="名前 / チップ下4桁"
        aria-label="名前またはマイクロチップ番号で検索"
        className="num tap w-full bg-transparent text-[16px] outline-none placeholder:font-adm placeholder:text-[14px] placeholder:text-[#A6A9A4]"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          aria-label="検索をクリア"
          className="tap shrink-0 px-1 text-[16px] text-adm-muted"
        >
          ×
        </button>
      )}
    </div>
  );
}
