export type NavItem = {
  name: string;
  href: string;
};

/** Figma: ヘッダーのナビゲーション（表記もFigma準拠） */
export const navItems: NavItem[] = [
  { name: "犬舎について", href: "/about" },
  { name: "仔犬紹介", href: "/puppies" },
  { name: "里親募集", href: "/adoption" },
  { name: "見学について", href: "/visit" },
  { name: "お問い合わせ", href: "/contact" },
  { name: "Q＆A", href: "/faq" },
];

/**
 * フッターのナビゲーション。
 * Figmaのヘッダーは6項目固定のため、生体保証はフッターからの導線とする。
 */
export const footerNavItems: NavItem[] = [
  { name: "HOME", href: "/" },
  ...navItems,
  { name: "生体保証", href: "/warranty" },
];
