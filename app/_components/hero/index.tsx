import Image from "next/image";
import TrackedButton from "@/app/_common/ui/TrackedButton";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import FadeInSection from "@/app/_common/FadeInSection";
import HeroSlideshow from "./HeroSlideshow";

/**
 * キービジュアル ＋ ABOUT US。
 * ヒーローは dog_breeder_ran と同じ全幅スライドショー。
 * その下のABOUT USは Figma（TOP_PC / ABOUTUS）の緑の丘の上に置き、ヒーローの丘と地続きにする。
 */
export const HeroSection = () => (
  <>
    <HeroSlideshow />

    <section className="relative bg-green pb-[80px] pt-2" aria-label="ドッグガーデンシュシュについて">
      {/* 草の装飾 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[6%] bottom-[47px] top-0 bg-no-repeat opacity-90"
        style={{ backgroundImage: "url('/assets/grass.svg')", backgroundSize: "100% 100%" }}
      />

      {/* 花の装飾（PCのみ） */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        <Image src="/assets/flower-purple.svg" alt="" width={41} height={59} className="absolute left-[9%] top-[14%]" />
        <Image src="/assets/flower-pink.svg" alt="" width={35} height={51} className="absolute left-[16%] top-[26%]" />
        <Image src="/assets/flower-pink.svg" alt="" width={35} height={51} className="absolute left-[81%] top-[18%] -scale-x-100" />
        <Image src="/assets/flower-purple.svg" alt="" width={41} height={59} className="absolute left-[88%] top-[30%] -scale-x-100" />
        <Image src="/assets/flower-purple.svg" alt="" width={41} height={59} className="absolute left-[11%] top-[66%]" />
        <Image src="/assets/flower-pink.svg" alt="" width={35} height={51} className="absolute left-[85%] top-[70%] -scale-x-100" />
      </div>

      <FadeInSection className="relative mx-auto flex max-w-[1024px] flex-col items-center px-5 md:px-[45px]">
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

        <SectionHeading en="ABOUT US" ja="ドッグガーデンシュシュについて" className="relative z-10" />

        <div className="mt-4 flex flex-col items-center gap-4">
          <p className="measure-560 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
            ドッグガーデンシュシュでは、家庭的な環境で愛情を込めて子犬たちを育てています。お庭や室内を元気いっぱいに走り回れるよう環境を整え、健康管理や衛生面にも気を配りながら、安心して一緒に暮らせるよう心がけています。家族の一員として、たくさんの愛情に包まれて過ごせる未来を願い、ひとりひとり大切に育てています。
          </p>
          <TrackedButton href="/about" kind="cta" location="top_about" label="READ MORE" variant="greenDark">
            READ MORE
          </TrackedButton>
        </div>
      </FadeInSection>

      {/* 下端の波形でBEIGEのセクションへつなぐ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[47px] bg-no-repeat"
        style={{ backgroundImage: "url('/assets/hill-wave-bottom.svg')", backgroundSize: "100% 100%" }}
      />
    </section>
  </>
);

export default HeroSection;
