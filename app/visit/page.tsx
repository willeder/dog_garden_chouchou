import Image from "next/image";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { kennelInfo } from "@/app/_data/kennelInfo";

export const metadata = buildMetadata(
  "見学について",
  "ドッグガーデンシュシュの見学に関するご案内とご予約はこちらから。"
);

export default function VisitPage() {
  return (
    <>
      {/* VISITUS_1 */}
      <section className="relative bg-blue pt-8">
        <CloudDecoration />
        <FadeInSection className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[232px]">
          <SectionHeading en="VISIT US" ja="見学の注意点" />
          {/* TODO: Figmaはダミーテキストのため、実際の注意事項を受領後に差し替える */}
          <p className="measure-560 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
            テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。
          </p>
        </FadeInSection>
      </section>

      {/* VISITUS_2: 予約カレンダー */}
      <section className="bg-blue pb-12 pt-8">
        <FadeInSection className="mx-auto flex max-w-[1024px] justify-center px-5 md:px-[162px]">
          {kennelInfo.reservationUrl ? (
            <iframe
              src={kennelInfo.reservationUrl}
              title="見学予約カレンダー"
              className="measure-700 h-[722px] w-full border-0"
              loading="lazy"
            />
          ) : (
            // 予約システムのURL受領までは、Figma掲載のカレンダー画像を表示
            <Image
              src="/assets/visit-calendar.png"
              alt="見学予約カレンダー"
              width={700}
              height={722}
              className="measure-700 h-auto"
            />
          )}
        </FadeInSection>
      </section>

      <BackLink />
    </>
  );
}
