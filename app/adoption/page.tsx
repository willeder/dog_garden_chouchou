import Image from "next/image";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import LineGuide from "@/app/_common/LineGuide";
import BackLink from "@/app/_layout/back";
import { adoptionMessage } from "@/app/_data/adoptionMessage";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { breadcrumbJsonLd } from "@/app/_config/structuredData";
import JsonLd from "@/app/_common/JsonLd";

export const metadata = buildMetadata(
  "里親募集",
  "福岡県筑紫野市のブリーダー「ドッグガーデンシュシュ」の里親募集ページです。犬舎で暮らしてきた子たちの新しいご家族を探しています。ご相談は公式LINEにて承ります。",
  "/adoption"
);

export default function AdoptionPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "里親募集", path: "/adoption" }])} />

      {/* INFO_1: 里親のお迎えについて */}
      <section className="relative bg-blue pt-8">
        <CloudDecoration />
        <FadeInSection className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-6 px-5 md:px-[162px]">
          <SectionHeading en="INFO" ja="里親のお迎えについて" as="h1" />

          <Image
            src="/assets/adoption-hero.png"
            alt="里親さんのもとへ向かうわんちゃん"
            width={700}
            height={315}
            priority
            className="measure-700 h-auto object-cover object-top"
          />

          <div className="measure-700 flex flex-col items-center gap-4">
            {/* 絵文字（🌷）は装飾の花アイコンに置き換えている */}
            <h2 className="flex items-center gap-2 text-center font-jp text-[18px] font-extrabold leading-[1.6] text-ink-light md:text-[22px]">
              <Image
                src="/assets/flower-pink.svg"
                alt=""
                aria-hidden
                width={24}
                height={35}
                className="h-[26px] w-auto shrink-0"
              />
              {adoptionMessage.title}
            </h2>

            <div className="measure-560 flex flex-col gap-4">
              {adoptionMessage.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="whitespace-pre-line font-jp text-[14px] leading-[1.9] text-ink-light md:text-[16px]"
                >
                  {paragraph}
                </p>
              ))}

              {/* 原稿末尾の絵文字（🐾）は装飾の肉球アイコンに置き換えている */}
              <p className="whitespace-pre-line font-jp text-[14px] leading-[1.9] text-ink-light md:text-[16px]">
                {adoptionMessage.closing}
                <Image
                  src="/assets/paw.svg"
                  alt=""
                  aria-hidden
                  width={52}
                  height={41}
                  className="ml-1 inline-block h-[16px] w-auto translate-y-[2px]"
                />
              </p>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* お問い合わせ（公式LINE）。里親募集中の子の情報は個別掲載せず、LINEでご案内する */}
      <section className="bg-blue pb-20 pt-12" aria-labelledby="adoption-contact">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-10">
          <FadeInSection className="flex flex-col items-center gap-3 text-center">
            <h2
              id="adoption-contact"
              className="font-jp text-[20px] font-extrabold leading-[1.6] text-ink-light md:text-[24px]"
            >
              里親のお問い合わせ
            </h2>
            <p className="measure-560 font-jp text-[14px] leading-[1.9] text-ink-light md:text-[16px]">
              現在里親を募集している子のご紹介は、公式LINEにて個別にご案内しています。
              ご家族構成や飼育環境をお伺いしたうえで、その子に合ったお迎えをご相談させていただきます。
              まずはお気軽にメッセージをお送りください。
            </p>
          </FadeInSection>

          <FadeInSection className="flex w-full justify-center">
            <LineGuide location="adoption_page" />
          </FadeInSection>
        </div>
      </section>

      <BackLink />
    </>
  );
}
