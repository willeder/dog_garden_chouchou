import Image from "next/image";
import Link from "next/link";
import Logo from "@/app/_common/ui/Logo";
import SocialLinks from "@/app/_common/ui/SocialLinks";
import NavList from "@/app/_layout/header/NavList";
import { footerNavItems } from "@/app/_layout/header/constants";

/**
 * Figma: base/FOOTER（1024×223）
 * bg BLUE #EAF1F2 ＋ 下部にGREENの丘（footer-wave.svg）
 * 装飾: 花（ピンク/パープル）と小鳥
 */
export const Footer = () => (
  <footer className="relative overflow-hidden bg-blue">
    {/* 緑の丘 */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[218px]">
      <Image
        src="/assets/footer-wave.svg"
        alt=""
        aria-hidden
        fill
        className="object-fill"
      />
    </div>

    {/* 装飾（花・小鳥）はPCのみ */}
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      <Image
        src="/assets/flower-pink.svg"
        alt=""
        width={35}
        height={51}
        className="absolute left-[25.4%] top-[8.6%] -scale-x-100"
      />
      <Image
        src="/assets/flower-pink.svg"
        alt=""
        width={35}
        height={51}
        className="absolute left-[71.2%] top-[8.6%]"
      />
      <Image
        src="/assets/flower-purple.svg"
        alt=""
        width={41}
        height={59}
        className="absolute left-[11.6%] top-[18.8%]"
      />
      <Image
        src="/assets/flower-purple.svg"
        alt=""
        width={41}
        height={59}
        className="absolute left-[84.4%] top-[18.8%] -scale-x-100"
      />
      <Image
        src="/assets/bird.svg"
        alt=""
        width={112}
        height={28}
        className="absolute left-[31%] top-[24.5%] opacity-70"
      />
      <Image
        src="/assets/bird.svg"
        alt=""
        width={112}
        height={28}
        className="absolute left-[58%] top-[24.5%] opacity-70"
      />
    </div>

    <div className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-6 px-5 pb-6 pt-14 md:px-[68px] md:pt-[90px]">
      <div className="flex w-full flex-col items-center gap-4 md:relative md:flex-row md:justify-center">
        <Logo className="w-[200px] md:w-[262px]" asPlainImage />
        <SocialLinks className="md:absolute md:right-0 md:top-0" />
      </div>

      <NavList items={footerNavItems} className="w-full" />

      <Link
        href="/policy"
        className="font-jp text-[12px] leading-[1.6] text-ink-light underline underline-offset-4 transition-opacity hover:opacity-70"
      >
        プライバシーポリシー
      </Link>
    </div>
  </footer>
);

export default Footer;
