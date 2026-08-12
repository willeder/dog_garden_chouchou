import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import PrivacyPolicy from "./_components/PrivacyPolicy";

export const metadata = buildMetadata(
  "プライバシーポリシー",
  "ドッグガーデンシュシュの個人情報の取り扱いについてご案内します。"
);

export default function PolicyPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-blue py-8">
        <CloudDecoration />
        <div className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-[162px]">
          <FadeInSection>
            <SectionHeading en="POLICY" ja="プライバシーポリシー" />
          </FadeInSection>
          <FadeInSection className="flex w-full justify-center">
            <PrivacyPolicy />
          </FadeInSection>
        </div>
      </section>

      <BackLink />
    </>
  );
}
