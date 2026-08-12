"use client";

import { useState } from "react";
import Logo from "@/app/_common/ui/Logo";
import Icon from "@/app/_common/ui/Icon";
import NavList from "./NavList";
import MobileMenu from "./MobileMenu";
import { useScrollBehavior } from "./useScrollBehavior";
import { navItems } from "./constants";

/**
 * Figma: base/Frame 3
 * PC 1024×148 / bg PINK #F0D0D8
 * 中央にロゴ（262×58）、その下にナビゲーション（gap 32px、区切り線あり）
 * スクロール挙動は dog_breeder_ran の useScrollBehavior を踏襲
 */
export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerClasses = useScrollBehavior();

  return (
    <>
      <header className={headerClasses}>
        {/* PC */}
        <div className="mx-auto hidden max-w-[1024px] flex-col items-center justify-center gap-4 px-10 py-6 md:flex lg:px-[60px]">
          <Logo className="w-[262px]" />
          <NavList items={navItems} />
        </div>

        {/* SP */}
        <div className="flex h-[72px] items-center justify-between px-5 md:hidden">
          <Logo className="w-[160px]" />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="メニューを開く"
            className="p-2 text-ink-light"
          >
            <Icon type="menu" />
          </button>
        </div>
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

export default Header;
