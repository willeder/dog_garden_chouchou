import SectionHeading from "@/app/_common/ui/SectionHeading";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { ContactSection } from "@/app/_components/contact";
import { getPuppies } from "@/app/_api/puppies/get";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { breadcrumbJsonLd } from "@/app/_config/structuredData";
import JsonLd from "@/app/_common/JsonLd";
import { Suspense } from "react";
import PuppyList from "./_components/PuppyList";

// ISR: 1時間ごとに再生成（app/_config/isr.ts の defaultRevalidateTime と同値）
export const revalidate = 3600;

export const metadata = buildMetadata(
  "仔犬紹介",
  "福岡県筑紫野市のブリーダー「ドッグガーデンシュシュ」の子犬一覧です。マルチーズ・チワワ・トイプードル・ビションフリーゼ・ミックス犬を犬種から絞り込んでご覧いただけます。",
  "/puppies"
);

export default async function PuppiesPage() {
  const puppies = await getPuppies();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "仔犬紹介", path: "/puppies" }])} />

      <section className="bg-beige pb-12 pt-8">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-10 lg:px-[100px]">
          <FadeInSection>
            <SectionHeading en="PUPPY INFO" ja="仔犬紹介" as="h1" />
          </FadeInSection>
          {/* useSearchParams を使うため Suspense で包む */}
          <Suspense fallback={null}>
            <PuppyList puppies={puppies} />
          </Suspense>
        </div>
      </section>

      <ContactSection location="puppy_list_bottom" />
      <BackLink />
    </>
  );
}
