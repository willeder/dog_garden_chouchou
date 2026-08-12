"use client";

import Script from "next/script";

type GoogleAnalyticsProps = {
  /** GA4の測定ID（G-XXXXXXXXXX） */
  gaId: string;
};

/** dog_breeder_ran と同構成。測定IDは NEXT_PUBLIC_GA_ID で管理する */
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
        gtag('config', '${gaId}');
      `}
    </Script>
  </>
);

export default GoogleAnalytics;
