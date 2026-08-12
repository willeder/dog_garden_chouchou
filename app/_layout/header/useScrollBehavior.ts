"use client";

import { useEffect, useState } from "react";

/**
 * 下方向スクロールでヘッダーを隠し、上方向スクロールで再表示する。
 * dog_breeder_ran の同名フックを踏襲。
 */
export const useScrollBehavior = (): string => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // ページ最上部では常に表示
      if (currentScrollY < 10) {
        setIsScrolled(false);
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      const isScrollingDown = currentScrollY > lastScrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      setIsScrolled(true);

      // 小さなスクロール変化は無視
      if (scrollDifference < 10) {
        setLastScrollY(currentScrollY);
        return;
      }

      setIsVisible(!isScrollingDown);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlHeader, { passive: true });
    return () => window.removeEventListener("scroll", controlHeader);
  }, [lastScrollY]);

  return [
    "fixed inset-x-0 top-0 z-50 w-full bg-pink transition-[translate] duration-300",
    isScrolled ? "shadow-md" : "",
    isVisible ? "translate-y-0" : "-translate-y-full",
  ].join(" ");
};

export default useScrollBehavior;
