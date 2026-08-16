"use client";

import React from "react";
import Link from "next/link";
import { trackCtaClick, trackLineClick, trackSocialClick } from "@/app/_lib/analytics";

type TrackedLinkProps = {
  children: React.ReactNode;
  href: string;
  kind: "line" | "social" | "cta";
  location: string;
  network?: "instagram" | "tiktok";
  label?: string;
  className?: string;
  "aria-label"?: string;
};

/**
 * クリックをGA4に送る素のリンク（ボタン以外の導線用）。
 * 計測内容は文字列propsで指定するため、サーバーコンポーネントからも使える。
 */
export const TrackedLink = ({
  children,
  href,
  kind,
  location,
  network,
  label,
  className = "",
  "aria-label": ariaLabel,
}: TrackedLinkProps) => {
  const handleClick = () => {
    if (kind === "line") return trackLineClick(location);
    if (kind === "social") return trackSocialClick(network ?? "instagram", location);
    return trackCtaClick({ cta_label: label ?? href, link_location: location, to: href });
  };

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} aria-label={ariaLabel} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default TrackedLink;
