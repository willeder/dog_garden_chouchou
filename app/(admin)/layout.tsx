import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New, JetBrains_Mono } from "next/font/google";

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-kaku",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

/**
 * 管理アプリのレイアウト。/admin と /login がここに入る。
 *
 * 公開サイトのヘッダー・フッター・配色は一切継承しない。
 * <body> はルートにあるので div で包み、背景と文字色をここで上書きする。
 */
export const metadata: Metadata = {
  title: { default: "シュシュ台帳", template: "%s｜シュシュ台帳" },
  description: "ドッグガーデンシュシュ 犬舎管理",
  // 管理アプリを検索結果に出さない。sitemap にも入れていない。
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`adm-root ${zenKaku.variable} ${jetbrains.variable} min-h-dvh bg-adm-paper text-adm-ink`}
    >
      {children}
    </div>
  );
}
