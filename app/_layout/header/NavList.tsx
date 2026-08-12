"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import type { NavItem } from "./constants";

type NavListProps = {
  items: NavItem[];
  className?: string;
};

/** 区切り線付きの横並びナビゲーション（Figma: 32px gap ＋ 14pxの縦罫線） */
export const NavList = ({ items, className = "" }: NavListProps) => {
  const pathname = usePathname();

  return (
    <nav className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-x-[32px] gap-y-2">
        {items.map((item, index) => {
          const isCurrent =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Fragment key={item.href}>
              {index > 0 && (
                <li aria-hidden className="hidden h-[14px] w-px bg-ink-light lg:block" />
              )}
              <li>
                <Link
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`whitespace-nowrap font-jp text-[14px] leading-[1.6] text-ink-light transition-opacity hover:opacity-70 lg:text-[16px] ${
                    isCurrent ? "underline underline-offset-4" : ""
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            </Fragment>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavList;
