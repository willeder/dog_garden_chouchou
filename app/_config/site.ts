/**
 * サイト全体で使う絶対URLの基準。
 * 本番は NEXT_PUBLIC_SITE_URL に独自ドメイン（https://example.com 形式・末尾スラッシュ無し）を設定する。
 * canonical / sitemap / robots / OGP画像 / 構造化データ の全てがこの値を参照するため、
 * ドメイン確定後はこの環境変数を差し替えるだけで全て追従する。
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** 絶対URLを組み立てる（path は "/about" 形式、トップは ""） */
export const absoluteUrl = (path = "") => `${siteUrl}${path}`;

/** OGP画像（1200×630）のパス */
export const ogImagePath = "/assets/ogp.png";
