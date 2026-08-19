import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import TrackedButton from "@/app/_common/ui/TrackedButton";
import BackLink from "@/app/_layout/back";
import { faqItems } from "@/app/_data/faqData";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { breadcrumbJsonLd } from "@/app/_config/structuredData";
import JsonLd from "@/app/_common/JsonLd";
import AccordionItem from "./_components/AccordionItem";

export const metadata = buildMetadata(
  "よくある質問",
  "お迎えにかかる費用、子犬ごとの価格の違い、健康状態、お迎え時に必要なもの、アフターフォロー、トイレトレーニングなど、福岡県筑紫野市のブリーダー「ドッグガーデンシュシュ」に寄せられるよくあるご質問にお答えします。",
  "/faq"
);

export default function FaqPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "よくある質問", path: "/faq" }])} />

      <section className="relative overflow-hidden bg-blue py-8">
        <CloudDecoration />
        <div className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-10 px-5 md:px-[162px]">
          <FadeInSection>
            <SectionHeading en="Q&A" ja="よくある質問" as="h1" />
          </FadeInSection>

          <FadeInSection className="flex w-full flex-col items-center">
            <ul className="flex w-full flex-col items-center gap-6">
              {faqItems.map((faq) => (
                <AccordionItem key={faq.id} faq={faq} />
              ))}
            </ul>
          </FadeInSection>

          <FadeInSection className="flex w-full justify-center">
            <div className="measure-700 flex flex-col items-center gap-3 rounded-[30px] bg-white px-6 py-10 text-center shadow-pop md:px-[50px]">
              <h2 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
                解決しないご質問はありませんか？
              </h2>
              <p className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
                お気軽に公式LINEよりお問い合わせください。
              </p>
              <TrackedButton href="/contact" kind="cta" location="faq_page" label="お問い合わせはこちら" variant="green" font="jp">
                お問い合わせはこちら
              </TrackedButton>
            </div>
          </FadeInSection>
        </div>
      </section>

      <BackLink />
    </>
  );
}
