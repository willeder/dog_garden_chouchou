import Image from "next/image";
import Button from "@/app/_common/ui/Button";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import FadeInSection from "@/app/_common/FadeInSection";
import HeroCarousel from "./HeroCarousel";

/**
 * Figma: TOP_PC / ABOUTUS（1024×795）
 * 空・丘・草花のイラスト背景の上に、ヒーローカルーセルとABOUT USを重ねる
 */
export const HeroSection = () => (
  <section
    className="relative bg-blue bg-[length:100%_100%] bg-no-repeat"
    style={{ backgroundImage: "url('/assets/top-about-bg.svg')" }}
    aria-label="ドッグガーデンシュシュについて"
  >
    <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-5 px-5 pb-16 pt-8 md:px-[45px] md:pb-[106px] md:pt-12">
      <HeroCarousel />

      <FadeInSection className="flex flex-col items-center">
        {/* 犬のイラストが骨型プレートに重なる（Figma: mb -52px） */}
        <div className="relative -mb-[36px] w-[280px] md:-mb-[52px] md:w-[393px]">
          <Image
            src="/assets/about-dogs.svg"
            alt=""
            aria-hidden
            width={393}
            height={164}
            className="h-auto w-full"
          />
        </div>

        <SectionHeading en="ABOUT US" ja="ドックガーデンシュシュについて" className="relative z-10" />

        <div className="mt-4 flex flex-col items-center gap-4">
          <p className="measure-560 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
            ドッグガーデンシュシュでは、家庭的な環境で愛情を込めて子犬たちを育てています。お庭や室内を元気いっぱいに走り回れるよう環境を整え、健康管理や衛生面にも気を配りながら、安心して一緒に暮らせるよう心がけています。家族の一員として、たくさんの愛情に包まれて過ごせる未来を願い、ひとりひとり大切に育てています。
          </p>
          <Button href="/about" variant="greenDark">
            READ MORE
          </Button>
        </div>
      </FadeInSection>
    </div>
  </section>
);

export default HeroSection;
