import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import Button from "@/app/_common/ui/Button";
import BackLink from "@/app/_layout/back";
import { faqCategories } from "@/app/_data/faqData";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import AccordionItem from "./_components/AccordionItem";

export const metadata = buildMetadata(
  "よくある質問",
  "しつけ・飼育方法・お迎え前の準備など、ドッグガーデンシュシュに寄せられるよくあるご質問をまとめました。"
);

export default function FaqPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-blue py-8">
        <CloudDecoration />
        <div className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-10 px-5 md:px-[162px]">
          <FadeInSection>
            <SectionHeading en="Q&A" ja="よくある質問" />
          </FadeInSection>

          {faqCategories.map((category, categoryIndex) => (
            <FadeInSection key={category.id} className="flex w-full flex-col items-center gap-4">
              <h2 className="measure-700 flex items-center gap-3 font-jp text-[18px] font-extrabold leading-[1.6] text-ink-light md:text-[20px]">
                <span
                  aria-hidden
                  className="inline-block h-[10px] w-[10px] shrink-0 rounded-full bg-pink"
                />
                {category.title}
              </h2>

              <ul className="flex w-full flex-col items-center gap-6">
                {category.items.map((faq, index) => (
                  <AccordionItem
                    key={faq.id}
                    faq={faq}
                    defaultOpen={categoryIndex === 0 && index === 0}
                  />
                ))}
              </ul>
            </FadeInSection>
          ))}

          <FadeInSection className="flex w-full justify-center">
            <div className="measure-700 flex flex-col items-center gap-3 rounded-[30px] bg-white px-6 py-10 text-center shadow-pop md:px-[50px]">
              <h2 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
                解決しないご質問はありませんか？
              </h2>
              <p className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
                お気軽に公式LINEよりお問い合わせください。
              </p>
              <Button href="/contact" variant="green" font="jp">
                お問い合わせはこちら
              </Button>
            </div>
          </FadeInSection>
        </div>
      </section>

      <BackLink />
    </>
  );
}
