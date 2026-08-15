import Image from "next/image";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import Button from "@/app/_common/ui/Button";
import FadeInSection from "@/app/_common/FadeInSection";
import { getPuppies } from "@/app/_api/puppies/get";
import { breeds } from "@/app/_model/breed";
import BreedCard from "./BreedCard";

/** microCMSに該当犬種の写真が無い場合に使う代表画像 */
const fallbackImages: Record<string, string> = {
  マルチーズ: "/assets/top-puppy-photo-1.jpg",
  ミックス: "/assets/top-puppy-photo-2.jpg",
  チワワ: "/assets/top-puppy-photo-3.jpg",
  ビションフリーぜ: "/assets/top-puppy-photo-4.jpg",
  トイプードル: "/assets/top-puppy-photo-5.jpg",
};

/**
 * Figma: TOP_PC / PUPPYINFO（1024×871 / bg BEIGE）
 * 犬種カードから、仔犬一覧をその犬種で絞り込んだ状態へ遷移させる導線。
 */
export const PuppiesSection = async () => {
  const puppies = await getPuppies();

  const cards = breeds.map((breed) => {
    const matched = puppies.filter((puppy) => puppy.breed === breed);
    return {
      breed,
      count: matched.length,
      src: matched[0]?.images[0]?.url ?? fallbackImages[breed],
    };
  });

  return (
    <section className="bg-beige py-12" aria-labelledby="top-puppy-info">
      <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-12 px-5 md:px-[130px]">
        <FadeInSection className="flex flex-col items-center">
          <SectionHeading en="PUPPY INFO" ja="仔犬紹介" />
          <p
            id="top-puppy-info"
            className="measure-560 mt-2 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]"
          >
            のびのびと元気に育った子犬たちの紹介です。
            <br />
            毎日お庭やお部屋で遊びながら、たくさんの愛情を受けてすくすく成長しました。それぞれの個性や表情をぜひご覧ください。
          </p>
        </FadeInSection>

        <FadeInSection className="flex flex-col items-center gap-8">
          <ul className="flex flex-wrap items-start justify-center gap-x-8 gap-y-8 lg:gap-x-12">
            {cards.map((card) => (
              <BreedCard key={card.breed} {...card} />
            ))}
            <li className="hidden shrink-0 self-center lg:block" aria-hidden>
              <Image
                src="/assets/top-puppy-dogs-group.svg"
                alt=""
                width={166}
                height={130}
                className="opacity-90"
              />
            </li>
          </ul>

          <Button href="/puppies" variant="greenDark">
            READ MORE
          </Button>
        </FadeInSection>
      </div>
    </section>
  );
};

export default PuppiesSection;
