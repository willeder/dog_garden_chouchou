import type { Metadata } from "next";
import { defaultMetadata } from "./_config/metadata";
import "./globals.css";

/**
 * ルートレイアウト。
 *
 * ここには <html> と <body> しか置かない。
 * 公開サイトと管理アプリでヘッダー・フォント・配色がまったく違うため、
 * 見た目は (site) / (admin) それぞれのレイアウトが持つ。
 *
 * ルートグループ（丸括弧のフォルダ）はURLに現れないので、
 * /about も /admin もパスは変わらない。
 */

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
