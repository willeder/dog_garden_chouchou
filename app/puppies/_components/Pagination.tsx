"use client";

import Image from "next/image";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
};

/** 仔犬一覧のページネーション（1ページ12件） */
export const Pagination = ({ currentPage, totalPages, onChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const move = (page: number) => {
    onChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav aria-label="ページ送り" className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => move(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="前のページへ"
        className="p-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:opacity-60"
      >
        <Image src="/assets/arrow-left.svg" alt="" aria-hidden width={10} height={26} />
      </button>

      <ul className="flex items-center gap-2">
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <li key={page}>
              <button
                type="button"
                onClick={() => move(page)}
                aria-current={isCurrent ? "page" : undefined}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full font-jp text-[14px] font-extrabold leading-none transition-opacity ${
                  isCurrent
                    ? "bg-pink text-white shadow-btn"
                    : "bg-white text-ink-light hover:opacity-70"
                }`}
              >
                {page}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => move(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="次のページへ"
        className="p-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:opacity-60"
      >
        <Image src="/assets/arrow-right.svg" alt="" aria-hidden width={10} height={26} />
      </button>
    </nav>
  );
};

export default Pagination;
