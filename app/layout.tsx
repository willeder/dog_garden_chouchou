import type { Metadata } from "next";
import { M_PLUS_1p, Poller_One } from "next/font/google";
import { Header } from "./_layout/header";
import { Footer } from "./_layout/footer";
import { GoogleAnalytics } from "./_components/GoogleAnalytics";
import { defaultMetadata } from "./_config/metadata";
import "./globals.css";

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

export const metadata: Metadata = defaultMetadata;

// GA4の測定ID。未設定ならタグを出力しない
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body
        className={`${mplus1p.variable} ${pollerOne.variable} flex min-h-screen flex-col bg-beige text-ink-light`}
      >
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Header />
        <main className="flex-grow pt-[72px] md:pt-[148px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
