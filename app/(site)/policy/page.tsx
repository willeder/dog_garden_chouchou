import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { breadcrumbJsonLd } from "@/app/_config/structuredData";
import JsonLd from "@/app/_common/JsonLd";
import Terms from "./_components/Terms";
import PrivacyPolicy from "./_components/PrivacyPolicy";

export const metadata = buildMetadata(
  "利用規約・プライバシーポリシー",
  "ドッグガーデンシュシュの利用規約と、個人情報の取り扱い（プライバシーポリシー）についてご案内します。",
  "/policy"
);

const tabs = [
  { href: "#terms", label: "利用規約" },
  { href: "#privacy", label: "プライバシーポリシー" },
];

export default function PolicyPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "利用規約・プライバシーポリシー", path: "/policy" }])} />

      <section className="relative overflow-hidden bg-blue py-8">
        <CloudDecoration />
        <div className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-[162px]">
          <FadeInSection className="flex flex-col items-center gap-4">
            <SectionHeading en="POLICY" ja="利用規約・プライバシーポリシー" as="h1" />
            <ul className="flex flex-wrap items-center justify-center gap-4">
              {tabs.map((tab) => (
                <li key={tab.href}>
                  <a
                    href={tab.href}
                    className="inline-flex cursor-pointer items-center rounded-[5px] bg-pink px-6 py-[11px] font-jp text-[14px] font-extrabold leading-[1.6] text-white shadow-btn transition-opacity hover:opacity-80"
                  >
                    {tab.label}
                  </a>
                </li>
              ))}
            </ul>
          </FadeInSection>

          <FadeInSection className="flex w-full justify-center">
            <Terms />
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
