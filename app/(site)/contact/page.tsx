import BackLink from "@/app/_layout/back";
import { ContactSection } from "@/app/_components/contact";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { breadcrumbJsonLd } from "@/app/_config/structuredData";
import JsonLd from "@/app/_common/JsonLd";

export const metadata = buildMetadata(
  "お問い合わせ",
  "福岡県筑紫野市のブリーダー「ドッグガーデンシュシュ」へのお問い合わせページです。仔犬のお迎え・里親のご相談・見学のお申し込みは公式LINEにて承ります。",
  "/contact"
);

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "お問い合わせ", path: "/contact" }])} />

      <ContactSection headingLevel="h1" location="contact_page" />
      <BackLink />
    </>
  );
}
