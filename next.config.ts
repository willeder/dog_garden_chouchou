import type { NextConfig } from "next";

/**
 * 画像の配信元。
 * - Supabase Storage … 仔犬・親犬の写真（管理アプリからアップロードしたもの）
 * - microCMS        … お客様の声。こちらは台帳と無関係なので microCMS のまま残している
 */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
        pathname: "/assets/**",
      },
    ],
  },
  experimental: { optimizePackageImports: ["microcms-js-sdk"] },
};

export default nextConfig;
