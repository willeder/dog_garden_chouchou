import Image from "next/image";
import Button from "@/app/_common/ui/Button";
import FadeInSection from "@/app/_common/FadeInSection";
import { adoptionMessage } from "@/app/_data/adoptionMessage";

/** TOPには里親募集ページ本文の冒頭2段落だけを抜粋し、続きは READ MORE で /adoption へ誘導する */
const excerpt = adoptionMessage.paragraphs.slice(0, 2);

/** Figma: TOP_PC / INFO（1024×396 / bg BEIGE） */
export const AdoptionSection = () => (
  <section className="bg-beige pb-20" aria-labelledby="top-adoption-title">
    <FadeInSection className="mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:flex-row md:items-start md:justify-center md:px-[140px]">
      <Image
        src="/assets/top-info-dog-circle.svg"
        alt=""
        aria-hidden
        width={288}
        height={251}
        className="h-auto w-[220px] shrink-0 md:w-[288px]"
      />

      <div className="flex flex-col items-center gap-6 md:max-w-[421px]">
        <div className="flex flex-col items-center gap-3">
          <h2
            id="top-adoption-title"
            className="text-center font-jp text-[20px] font-extrabold leading-[1.6] text-ink-light md:text-[24px]"
          >
            里親のお迎えについて
          </h2>
          <div className="flex flex-col gap-4">
            {excerpt.map((paragraph) => (
              <p
                key={paragraph}
                className="whitespace-pre-line font-jp text-[14px] leading-[1.9] text-ink-light md:text-[16px]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
        <Button href="/adoption" variant="green">
          READ MORE
        </Button>
      </div>
    </FadeInSection>
  </section>
);

export default AdoptionSection;
