import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { faqs } from "@/app/_data/faqData";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import AccordionItem from "./_components/AccordionItem";

export const metadata = buildMetadata(
  "よくある質問",
  "ドッグガーデンシュシュに寄せられるよくあるご質問をまとめました。"
);

export default function FaqPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-blue py-8">
        <CloudDecoration />
        <div className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[162px]">
          <FadeInSection>
            <SectionHeading en="Q&A" ja="よくある質問" />
          </FadeInSection>

          <FadeInSection className="w-full">
            <ul className="flex flex-col items-center gap-12">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.id} faq={faq} defaultOpen={index === 0} />
              ))}
            </ul>
          </FadeInSection>
        </div>
      </section>

      <BackLink />
    </>
  );
}
