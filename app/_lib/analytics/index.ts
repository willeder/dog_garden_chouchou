/**
 * GA4 イベント計測の共通ロジック。
 *
 * 方針:
 *  - 計測IDが未設定の環境（開発・プレビュー）では何も送らない
 *  - イベント名・パラメータ名は snake_case（GA4の推奨）
 *  - 「何回押されたか」ではなく「どのページのどのボタンが押されたか」まで残す
 */

export const gaId = process.env.NEXT_PUBLIC_GA_ID ?? "";

export const isAnalyticsEnabled = gaId !== "";

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js" | "set",
      targetOrName: string | Date,
      params?: GtagParams
    ) => void;
    dataLayer?: unknown[];
  }
}

/** GA4へイベントを1件送る。gtagが未ロードでも安全に無視される */
export const trackEvent = (name: string, params: GtagParams = {}) => {
  if (!isAnalyticsEnabled) return;
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  // undefined のパラメータはGA4側で「(not set)」になるため落としておく
  const cleaned: GtagParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") cleaned[key] = value;
  }

  window.gtag("event", name, cleaned);
};

// ============================================================
// 個別イベント
// 命名は「対象_動作」で統一している
// ============================================================

/** 公式LINEの友だち追加ボタン。このサイトの最重要コンバージョン */
export const trackLineClick = (location: string) =>
  trackEvent("line_add_friend_click", {
    link_location: location,
    link_url: "line",
  });

/** SNSアイコン・SNSへの誘導ボタン */
export const trackSocialClick = (network: "instagram" | "tiktok", location: string) =>
  trackEvent("social_click", { social_network: network, link_location: location });

/** 仔犬詳細ページの閲覧。犬種別・ステータス別の人気度が分かる */
export const trackPuppyView = (params: {
  puppy_id: string;
  breed: string;
  sex: string;
  status: string;
  price?: number;
}) => trackEvent("view_puppy_detail", params);

/** 仔犬一覧の犬種フィルタ。どの犬種が探されているかが分かる */
export const trackBreedFilter = (breed: string, location: string) =>
  trackEvent("filter_breed", { breed, link_location: location });

/** 仔犬一覧のページ送り。2ページ目以降まで見られているかが分かる */
export const trackPagination = (page: number) => trackEvent("puppy_list_paginate", { page });

/** FAQの開閉。どの質問が読まれているかが分かる */
export const trackFaqOpen = (question: string) => trackEvent("faq_open", { faq_question: question });

/** 見学・お問い合わせページへの内部導線 */
export const trackCtaClick = (params: { cta_label: string; link_location: string; to: string }) =>
  trackEvent("cta_click", params);
