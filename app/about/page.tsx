import Image from "next/image";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import PointCard from "./_components/PointCard";
import Company from "./_components/Company";
import Registration from "./_components/Registration";
import StaffDay from "./_components/StaffDay";
import BreederProfileCard from "./_components/BreederProfile";
import { kennelPoints } from "./_components/data";

export const metadata = buildMetadata(
  "犬舎について",
  "ドッグガーデンシュシュの犬舎のこだわりと、ブリーダーの想いをご紹介します。"
);

export default function AboutPage() {
  return (
    <>
      {/* ABOUTUS_1 */}
      <section className="bg-beige pt-8">
        <FadeInSection className="mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[162px]">
          <SectionHeading en="ABOUT US" ja="ドックガーデンシュシュについて" />
          <Image
            src="/assets/about-hero-photo.png"
            alt="ドッグガーデンシュシュの犬舎で過ごすわんちゃんたち"
            width={700}
            height={315}
            priority
            className="measure-700 h-auto object-cover object-top"
          />
          <p className="measure-560 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
            わんちゃんたちが毎日楽しく過ごせる場所、それが「ドッグガーデンシュシュ」です。
            自然の中でのびのび遊びながら、たっぷりの愛情を受けて育つ毎日。
            新しい家族に出会うその日まで、わんちゃん一頭一頭の個性に寄り添い、大切に見守っています。
          </p>
        </FadeInSection>
      </section>

      {/* ABOUTUS_2 */}
      <section className="bg-beige py-12" aria-labelledby="kennel-points">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[81px]">
          <FadeInSection>
            {/*
              リボンのSVGに「犬舎の6つのこだわり」の文字が含まれているため、
              テキストを重ねず alt で見出しの意味を持たせる。
              文言を変更する場合はSVG自体の差し替えが必要。
            */}
            <h2 id="kennel-points" className="w-[320px] md:w-[390px]">
              <Image
                src="/assets/about-heading-6points-ribbon.svg"
                alt="犬舎の6つのこだわり"
                width={390}
                height={57}
                className="h-auto w-full"
              />
            </h2>
          </FadeInSection>

          <FadeInSection className="w-full">
            <ul className="grid grid-cols-1 justify-items-center gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {kennelPoints.map((point) => (
                <PointCard key={point.icon} {...point} />
              ))}
            </ul>
          </FadeInSection>
        </div>
      </section>

      {/* ABOUTUS_3: ブリーダー紹介 */}
      <section className="bg-blue py-12">
        <FadeInSection className="mx-auto flex max-w-[1024px] justify-center px-5 md:px-[162px]">
          <BreederProfileCard />
        </FadeInSection>
      </section>

      {/* スタッフの1日・犬舎概要・登録情報（dog_breeder_ran と同じ構成） */}
      <section className="bg-blue pb-12">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-[162px]">
          <FadeInSection className="flex w-full justify-center">
            <StaffDay />
          </FadeInSection>
          <FadeInSection className="flex w-full justify-center">
            <Company />
          </FadeInSection>
          <FadeInSection className="flex w-full justify-center">
            <Registration />
          </FadeInSection>
        </div>
      </section>

      <BackLink />
    </>
  );
}
