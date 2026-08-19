import Image from "next/image";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { breadcrumbJsonLd } from "@/app/_config/structuredData";
import JsonLd from "@/app/_common/JsonLd";
import PointCard from "./_components/PointCard";
import Company from "./_components/Company";
import Registration from "./_components/Registration";
import StaffDay from "./_components/StaffDay";
import BreederProfileCard from "./_components/BreederProfile";
import { kennelPoints } from "./_components/data";

export const metadata = buildMetadata(
  "犬舎について",
  "福岡県筑紫野市のブリーダー「ドッグガーデンシュシュ」の犬舎紹介です。6つのこだわり、ブリーダーの想い、スタッフの1日、第一種動物取扱業の登録情報をご案内します。",
  "/about"
);

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "犬舎について", path: "/about" }])} />

      {/* ABOUTUS_1 */}
      <section className="bg-beige pt-8">
        <FadeInSection className="mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[162px]">
          <SectionHeading en="ABOUT US" ja="ドッグガーデンシュシュについて" as="h1" />
          <Image
            src="/assets/about-hero-photo.png"
            alt="ドッグガーデンシュシュの犬舎で過ごすわんちゃんたち"
            width={700}
            height={315}
            priority
            className="measure-700 h-auto object-cover object-top"
          />
          {/*
            犬舎の紹介文（クライアント支給の原稿）。
            段落の区切りは原稿どおり。1文が長いので行間を 1.9 にして読みやすくしている。
          */}
          <div className="measure-560 flex flex-col gap-4 font-jp text-[14px] leading-[1.9] text-ink-light md:text-[16px]">
            <p>
              ドッグガーデンシュシュでは、わんちゃんたちが毎日楽しく、のびのびと過ごせるように、ストレスの少ない穏やかな環境づくりを大切にしています。
            </p>
            <p>
              親犬たちの健康面はもちろん、性格の良さも大切にしながら、一頭一頭にしっかりと寄り添い、たっぷりの愛情を注いで大切に育てています。
            </p>
            <p>
              日々のふれあいを通して、それぞれの個性や成長を見守りながら、健康で愛嬌があり、人懐っこく明るい子に育つよう、心を込めて向き合っています。
            </p>
            <p>
              <strong className="font-extrabold">「この子と出会えてよかった」</strong>
              と思っていただけるような、素敵なご縁をつなぐことも、ドッグガーデンシュシュが大切にしていることのひとつです。
            </p>
            <p>
              わんちゃんとご家族が、これから先もずっと幸せに暮らせるように――。
              <br />
              一頭一頭との時間を大切に、愛情を込めて育てています。
            </p>
          </div>
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
