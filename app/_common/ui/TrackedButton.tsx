"use client";

import React from "react";
import Button from "./Button";
import { trackCtaClick, trackLineClick, trackSocialClick } from "@/app/_lib/analytics";

type TrackedButtonProps = {
  children: React.ReactNode;
  href: string;
  /** line = 公式LINE友だち追加 / social = SNS / cta = サイト内の導線 */
  kind: "line" | "social" | "cta";
  /** どこに置かれたボタンか（例: contact_section / adoption_page / puppy_detail） */
  location: string;
  /** kind="social" のときのみ使用 */
  network?: "instagram" | "tiktok";
  /** kind="cta" のときの計測ラベル。未指定ならボタン文言の代わりに href を使う */
  label?: string;
  variant?: "green" | "greenDark" | "pink";
  font?: "en" | "jp";
  className?: string;
};

/**
 * クリックをGA4に送るボタン。
 * サーバーコンポーネントから使えるよう、計測内容は関数ではなく文字列propsで指定する。
 */
export const TrackedButton = ({
  children,
  href,
  kind,
  location,
  network,
  label,
  variant = "green",
  font = "en",
  className = "",
}: TrackedButtonProps) => {
  const handleClick = () => {
    if (kind === "line") return trackLineClick(location);
    if (kind === "social") return trackSocialClick(network ?? "instagram", location);
    return trackCtaClick({ cta_label: label ?? href, link_location: location, to: href });
  };

  return (
    <Button href={href} variant={variant} font={font} className={className} onClick={handleClick}>
      {children}
    </Button>
  );
};

export default TrackedButton;
