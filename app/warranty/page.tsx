import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import Button from "@/app/_common/ui/Button";
import BackLink from "@/app/_layout/back";
import { warrantyItems } from "@/app/_data/warrantyData";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import WarrantyCard from "./_components/WarrantyCard";

export const metadata = buildMetadata(
  "生体保証",
  "ドッグガーデンシュシュの生体保証についてご案内します。"
);

export default function WarrantyPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-blue py-8">
        <CloudDecoration />
        <div className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-[162px]">
          <FadeInSection className="flex flex-col items-center">
            <SectionHeading en="WARRANTY" ja="生体保証" />
            <p className="measure-560 mt-2 text-center font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
              安心してお迎えいただけるよう、すべての仔犬に生体保証をお付けしています。
              <br />
              健康で幸せに過ごせるよう、責任をもって対応いたします。
            </p>
          </FadeInSection>

          <FadeInSection className="w-full">
            <ul className="flex flex-col items-center gap-8">
              {warrantyItems.map((item, index) => (
                <WarrantyCard key={item.id} item={item} defaultOpen={index === 0} />
              ))}
            </ul>
          </FadeInSection>

          <FadeInSection className="flex w-full justify-center">
            <div className="measure-700 flex flex-col items-center gap-3 rounded-[30px] bg-white px-6 py-10 text-center shadow-pop md:px-[50px]">
              <h2 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
                保証内容についてご不明な点はありませんか？
              </h2>
              <p className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
                詳細については、お気軽に公式LINEよりお問い合わせください。
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
