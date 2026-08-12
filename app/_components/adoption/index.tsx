import Image from "next/image";
import Button from "@/app/_common/ui/Button";
import FadeInSection from "@/app/_common/FadeInSection";

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
        <div className="flex flex-col items-center gap-2">
          <h2
            id="top-adoption-title"
            className="text-center font-jp text-[20px] font-extrabold leading-[1.6] text-ink-light md:text-[24px]"
          >
            里親のお迎えについて
          </h2>
          <p className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
            わんちゃんたちがもっと幸せに暮らせるように、里親さんを募集しています。年齢を重ねると体の変化だけでなく、犬舎の中でも世代交代が起きて環境が変わりやすくなります。そんな中でも、ひとりひとりが家族としてたっぷりの愛情をもらいながら、穏やかに暮らしてほしい。そんな願いを込めて、里親さんを募集しています。
            新しいご家族として、お迎えを検討していただけたら嬉しいです。
          </p>
        </div>
        <Button href="/adoption" variant="green">
          READ MORE
        </Button>
      </div>
    </FadeInSection>
  </section>
);

export default AdoptionSection;
