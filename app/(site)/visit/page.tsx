import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { ContactSection } from "@/app/_components/contact";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { breadcrumbJsonLd } from "@/app/_config/structuredData";
import JsonLd from "@/app/_common/JsonLd";

export const metadata = buildMetadata(
  "見学について",
  "福岡県筑紫野市のブリーダー「ドッグガーデンシュシュ」の見学案内です。見学は完全予約制で、お申し込みは公式LINEにて承っております。",
  "/visit"
);

/** TODO: Figmaはダミーテキストのため、実際の注意事項を受領後に差し替える */
const notes = [
  "見学は完全予約制です。公式LINEよりご希望の日時をお知らせください。",
  "わんちゃんの体調やお世話の都合により、ご希望に添えない場合がございます。",
  "感染症予防のため、当日は他の犬舎やペットショップへ立ち寄らずにお越しください。",
  "小さなお子様とご一緒の場合は、わんちゃんの安全のため保護者の方が付き添いをお願いいたします。",
];

export default function VisitPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "見学について", path: "/visit" }])} />

      {/* VISITUS_1: 見学の注意点 */}
      <section className="relative bg-blue pt-8">
        <CloudDecoration />
        <FadeInSection className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[232px]">
          <SectionHeading en="VISIT US" ja="見学の注意点" as="h1" />
          <ul className="measure-560 flex flex-col gap-2">
            {notes.map((note) => (
              <li
                key={note}
                className="flex items-start gap-2 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]"
              >
                <span
                  aria-hidden
                  className="mt-[10px] block h-[6px] w-[6px] shrink-0 rounded-full bg-pink"
                />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </FadeInSection>
      </section>

      {/* 見学のお申し込みは公式LINE */}
      <div className="bg-blue pt-8" />
      <ContactSection location="visit_page" />

      <BackLink />
    </>
  );
}
