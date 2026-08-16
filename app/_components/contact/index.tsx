import Image from "next/image";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import FadeInSection from "@/app/_common/FadeInSection";
import LineGuide from "@/app/_common/LineGuide";

/**
 * Figma: TOP_PC / CONTACTUS（1024×1093 / bg BLUE ＋ 雲の装飾）
 * 中身は入力フォームではなく公式LINEへの導線。下層ページからも同じ構成で呼び出す。
 */
type ContactSectionProps = {
  /** お問い合わせページではこのセクションがページの主題になるため "h1" を渡す */
  headingLevel?: "h1" | "h2";
};

export const ContactSection = ({ headingLevel = "h2" }: ContactSectionProps) => (
  <section className="relative overflow-hidden bg-blue py-20" aria-labelledby="contact-title">
    {/* 装飾の雲 */}
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      <Image
        src="/assets/cloud-white.svg"
        alt=""
        width={146}
        height={76}
        className="absolute left-[5.5%] top-[7%]"
      />
      <Image
        src="/assets/cloud-white.svg"
        alt=""
        width={146}
        height={76}
        className="absolute left-[82%] top-[14%]"
      />
    </div>

    <div className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-[162px]">
      <FadeInSection className="flex flex-col items-center">
        <SectionHeading en="CONTACT US" ja="お問い合わせ" as={headingLevel} />
        <p
          id="contact-title"
          className="measure-560 mt-2 text-center font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]"
        >
          お迎え前の不安や疑問は、遠慮なくご相談ください。
          <br />
          わんちゃんの性格や暮らし方など、できるだけ詳しくお伝えします。
          <br />
          一緒に新しいご縁を考えていきましょう。
        </p>
      </FadeInSection>

      <FadeInSection className="flex w-full justify-center">
        <LineGuide />
      </FadeInSection>
    </div>
  </section>
);

export default ContactSection;
