import BackLink from "@/app/_layout/back";
import { ContactSection } from "@/app/_components/contact";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";

export const metadata = buildMetadata(
  "お問い合わせ",
  "ドッグガーデンシュシュへのお問い合わせはこちらのフォームからお願いいたします。"
);

export default function ContactPage() {
  return (
    <>
      <ContactSection />
      <BackLink />
    </>
  );
}
