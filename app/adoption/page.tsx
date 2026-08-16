import Image from "next/image";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { getRehomingDogs } from "@/app/_api/rehoming/get";
import { adoptionMessage } from "@/app/_data/adoptionMessage";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import RehomingCard from "./_components/RehomingCard";

// ISR: 1時間ごとに再生成（app/_config/isr.ts の defaultRevalidateTime と同値）
export const revalidate = 3600;

export const metadata = buildMetadata(
  "里親募集",
  "ドッグガーデンシュシュでは、新しいご家族との出会いを待っているわんちゃんの里親を募集しています。"
);

export default async function AdoptionPage() {
  const dogs = await getRehomingDogs();

  return (
    <>
      {/* INFO_1: 里親のお迎えについて */}
      <section className="relative bg-blue pt-8">
        <CloudDecoration />
        <FadeInSection className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-6 px-5 md:px-[162px]">
          <SectionHeading en="INFO" ja="里親のお迎えについて" />

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

      {/* 里親募集中のわんちゃん一覧 */}
      <section className="bg-blue pb-20 pt-12" aria-labelledby="rehoming-list">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-10">
          <FadeInSection>
            <h2
              id="rehoming-list"
              className="font-jp text-[20px] font-extrabold leading-[1.6] text-ink-light md:text-[24px]"
            >
              里親募集中のわんちゃん
            </h2>
          </FadeInSection>

          <FadeInSection className="w-full">
            {dogs.length === 0 ? (
              <p className="py-12 text-center font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
                現在、里親を募集しているわんちゃんはいません。次のご縁をお待ちください。
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {dogs.map((dog) => (
                  <RehomingCard key={dog.id} dog={dog} />
                ))}
              </ul>
            )}
          </FadeInSection>
        </div>
      </section>

      <BackLink />
    </>
  );
}
