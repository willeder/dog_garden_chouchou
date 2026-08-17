import type { MetadataRoute } from "next";
import { absoluteUrl } from "./_config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 管理アプリはクロールさせない。
        // meta の noindex（(admin)/layout.tsx）と併せて二重に塞ぐ。
        disallow: ["/admin", "/admin/", "/login", "/auth/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
