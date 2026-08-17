import { M_PLUS_1p, Poller_One } from "next/font/google";
import { Header } from "@/app/_layout/header";
import { Footer } from "@/app/_layout/footer";
import { GoogleAnalytics } from "@/app/_components/GoogleAnalytics";
import JsonLd from "@/app/_common/JsonLd";
import { organizationJsonLd, webSiteJsonLd } from "@/app/_config/structuredData";

const mplus1p = M_PLUS_1p({
  variable: "--font-mplus-1p",
  subsets: ["latin"],
  weight: ["500", "800"],
  display: "swap",
});

const pollerOne = Poller_One({
  variable: "--font-poller-one",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// GA4の測定ID。未設定ならタグを出力しない
const gaId = process.env.NEXT_PUBLIC_GA_ID;

/**
 * 公開サイトのレイアウト。
 * <body> はルートにあるので、ここでは div で包む。
 * 背景・文字色・フォントはこの div に付ける（管理アプリに漏らさないため）。
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${mplus1p.variable} ${pollerOne.variable} site-root flex min-h-screen flex-col bg-beige text-ink-light`}
    >
      {/* 犬舎そのものの情報。全ページに出すことで犬舎名検索での同定を強める */}
      <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
      {gaId && <GoogleAnalytics gaId={gaId} />}
      <Header />
      <main className="flex-grow pt-[72px] md:pt-[148px]">{children}</main>
      <Footer />
    </div>
  );
}
