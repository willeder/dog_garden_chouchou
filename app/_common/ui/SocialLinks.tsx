"use client";

import Image from "next/image";
import { kennelInfo } from "@/app/_data/kennelInfo";
import { trackSocialClick } from "@/app/_lib/analytics";

type SocialLinksProps = {
  className?: string;
  size?: number;
  /** GA4のクリック計測用。どこに置かれたSNSリンクかを識別する */
  location?: string;
};

/** TikTok / Instagram のリンク（Figma: FOOTER 右上） */
export const SocialLinks = ({ className = "", size = 35, location = "footer" }: SocialLinksProps) => (
  <ul className={`flex items-start gap-[15px] ${className}`}>
    {kennelInfo.sns.tiktok && (
      <li>
        <a
          href={kennelInfo.sns.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok"
          className="block transition-opacity hover:opacity-70"
          onClick={() => trackSocialClick("tiktok", location)}
        >
          <Image
            src="/assets/icon-tiktok.svg"
            alt="TikTok"
            width={31}
            height={size}
            style={{ height: size, width: "auto" }}
          />
        </a>
      </li>
    )}
    {kennelInfo.sns.instagram && (
      <li>
        <a
          href={kennelInfo.sns.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="block transition-opacity hover:opacity-70"
          onClick={() => trackSocialClick("instagram", location)}
        >
          <Image src="/assets/icon-instagram.svg" alt="Instagram" width={size} height={size} />
        </a>
      </li>
    )}
  </ul>
);

export default SocialLinks;
