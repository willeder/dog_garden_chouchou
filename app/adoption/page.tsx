import Image from "next/image";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { getRehomingDogs } from "@/app/_api/rehoming/get";
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
        <FadeInSection className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[162px]">
          <SectionHeading en="INFO" ja="里親のお迎えについて" />
          <Image
            src="/assets/adoption-hero.png"
            alt="里親さんのもとへ向かうわんちゃん"
            width={700}
            height={315}
            priority
            className="measure-700 h-auto object-cover object-top"
          />
          <p className="measure-560 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
            当犬舎ではしっかりとご飯が食べれるようになってからのお渡しになります。毎日母犬・兄妹犬・色々な子と遊びながら、スタッフとの触れ合いで人もワンチャンも大好きな子達に育っています。子犬期はよく食べよく遊びたまにお姉さん犬達から怒られたりと大切な時期です。沢山の触れ合いを大切に愛嬌のある元気な子達に育てています。
          </p>
        </FadeInSection>
      </section>

      {/* 里親募集中のわんちゃん一覧 */}
      <section className="bg-blue pb-20 pt-12" aria-labelledby="rehoming-list">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-10 lg:px-[100px]">
          <FadeInSection className="flex flex-col items-center">
            <h2
              id="rehoming-list"
              className="font-jp text-[20px] font-extrabold leading-[1.6] text-ink-light md:text-[24px]"
            >
              里親募集中のわんちゃん
            </h2>
            <p className="measure-560 mt-2 text-center font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
              出産・子育てをがんばってくれた子たちです。
              <br />
              これからの犬生を、家族として穏やかに過ごさせていただける方をお待ちしています。
            </p>
          </FadeInSection>

          <FadeInSection className="w-full">
            {dogs.length === 0 ? (
              <p className="py-12 text-center font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
                現在、里親を募集しているわんちゃんはいません。次のご縁をお待ちください。
              </p>
            ) : (
              <ul className="grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
