import Image from "next/image";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";

export const metadata = buildMetadata(
  "里親募集",
  "ドッグガーデンシュシュの里親のお迎えについてご案内します。"
);

export default function AdoptionPage() {
  return (
    <>
      {/* INFO_1 */}
      <section className="relative bg-blue pt-8">
        <CloudDecoration />
        <FadeInSection className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[162px]">
          <SectionHeading en="INFO" ja="里親のお迎えについて" />
          <Image
            src="/assets/adoption-hero.png"
            alt="里親さんのもとへ向かうわんちゃん"
            width={700}
            height={315}
            priority
            className="measure-700 h-auto object-cover object-bottom"
          />
          <p className="measure-560 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
            当犬舎ではしっかりとご飯が食べれるようになってからのお渡しになります。毎日母犬・兄妹犬・色々な子と遊びながら、スタッフとの触れ合いで人もワンチャンも大好きな子達に育っています。子犬期はよく食べよく遊びたまにお姉さん犬達から怒られたりと大切な時期です。沢山の触れ合いを大切に愛嬌のある元気な子達に育てています。
          </p>
        </FadeInSection>
      </section>

      {/* INFO_2: Figmaでは700×416のグレー枠のみ（動画または画像の想定）。要クライアント確認 */}
      <section className="bg-blue pb-20 pt-8">
        <FadeInSection className="mx-auto flex max-w-[1024px] justify-center px-5 md:px-[162px]">
          <div className="measure-700 flex aspect-[700/416] items-center justify-center bg-placeholder">
            <p className="font-jp text-[14px] leading-[1.6] text-white">動画・写真を掲載予定</p>
          </div>
        </FadeInSection>
      </section>

      <BackLink />
    </>
  );
}
