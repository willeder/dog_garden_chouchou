"use client";

import Script from "next/script";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type GoogleAnalyticsProps = {
  /** GA4の測定ID（G-XXXXXXXXXX） */
  gaId: string;
};

/**
 * App Router はクライアント側でページ遷移するため、gtag の自動 page_view では
 * タイトルが前ページのまま送られることがある。
 * そのため send_page_view:false にして、遷移完了後に自分で page_view を送る。
 */
const PageViewTracker = ({ gaId }: GoogleAnalyticsProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
      send_to: gaId,
    });
  }, [gaId, pathname, searchParams]);

  return null;
};

/** GA4。測定IDは NEXT_PUBLIC_GA_ID で管理する（未設定ならタグ自体を出力しない） */
export const GoogleAnalytics = ({ gaId }: GoogleAnalyticsProps) => (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}', { send_page_view: false });
      `}
    </Script>
    {/* useSearchParams を使うため Suspense で包む（App Routerの要件） */}
    <Suspense fallback={null}>
      <PageViewTracker gaId={gaId} />
    </Suspense>
  </>
);

export default GoogleAnalytics;
