import type { Metadata } from "next";
import { kennelInfo } from "../_data/kennelInfo";

export const defaultMetadata: Metadata = {
  title: {
    default: `${kennelInfo.name} | ${kennelInfo.nameEn}`,
    template: `%s | ${kennelInfo.name}`,
  },
  description: kennelInfo.description,
  keywords: [
    "ドッグガーデンシュシュ",
    "Dog Garden ChouChou",
    "ブリーダー",
    "仔犬",
    "子犬",
    "マルチーズ",
    "チワワ",
    "トイプードル",
    "ビションフリーゼ",
    "里親募集",
  ],
  authors: [{ name: kennelInfo.breeder }],
  creator: kennelInfo.name,
  publisher: kennelInfo.name,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: kennelInfo.name,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL },
};

/** 各ページ用のメタデータを生成するヘルパー */
export const generateMetadata = (
  title: string,
  description?: string
): Metadata => {
  const metaDescription = description || kennelInfo.description;
  return {
    ...defaultMetadata,
    title,
    description: metaDescription,
    openGraph: { ...defaultMetadata.openGraph, title, description: metaDescription },
    twitter: { ...defaultMetadata.twitter, title, description: metaDescription },
  };
};
