import type { Metadata } from "next";
import { kennelInfo } from "../_data/kennelInfo";
import { absoluteUrl, ogImagePath, siteUrl } from "./site";

/** 検索で狙う中心キーワード。地域名＋業種＋取扱犬種で構成する */
export const siteKeywords = [
  "ドッグガーデンシュシュ",
  "Dog Garden ChouChou",
  "福岡 ブリーダー",
  "筑紫野市 ブリーダー",
  "福岡 子犬",
  "マルチーズ ブリーダー 福岡",
  "チワワ ブリーダー 福岡",
  "トイプードル ブリーダー 福岡",
  "ビションフリーゼ ブリーダー 福岡",
  "タイニープードル 福岡",
  "ミックス犬 福岡",
  "里親募集 福岡",
];

/** タイトル末尾に付く固定の肩書き。犬舎名検索と地域検索の両方に効かせる */
const siteTagline = `福岡県筑紫野市のブリーダー`;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${kennelInfo.name}｜${siteTagline}`,
    template: `%s｜${kennelInfo.name}`,
  },
  description: kennelInfo.description,
  keywords: siteKeywords,
  authors: [{ name: kennelInfo.breeder }],
  creator: kennelInfo.name,
  publisher: kennelInfo.name,
  applicationName: kennelInfo.name,
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: kennelInfo.name,
    url: absoluteUrl("/"),
    title: `${kennelInfo.name}｜${siteTagline}`,
    description: kennelInfo.description,
    images: [{ url: ogImagePath, width: 1200, height: 630, alt: kennelInfo.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${kennelInfo.name}｜${siteTagline}`,
    description: kennelInfo.description,
    images: [ogImagePath],
  },
  alternates: { canonical: absoluteUrl("/") },
};

/**
 * 各ページ用のメタデータを生成するヘルパー。
 *
 * @param title       ページタイトル（末尾の犬舎名は template が自動で付ける）
 * @param description 検索結果に出る説明文。80〜120文字程度で地域名と犬種を含める
 * @param path        "/about" 形式のパス。canonical と og:url に使うため必ず渡すこと
 */
export const generateMetadata = (
  title: string,
  description?: string,
  path?: string
): Metadata => {
  const metaDescription = description || kennelInfo.description;
  const url = absoluteUrl(path ?? "/");

  return {
    ...defaultMetadata,
    title,
    description: metaDescription,
    alternates: { canonical: url },
    openGraph: {
      ...defaultMetadata.openGraph,
      url,
      title: `${title}｜${kennelInfo.name}`,
      description: metaDescription,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: `${title}｜${kennelInfo.name}`,
      description: metaDescription,
    },
  };
};
