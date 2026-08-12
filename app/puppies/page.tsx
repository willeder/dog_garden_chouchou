import SectionHeading from "@/app/_common/ui/SectionHeading";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { ContactSection } from "@/app/_components/contact";
import { getPuppies } from "@/app/_api/puppies/get";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import PuppyList from "./_components/PuppyList";

// ISR: 1時間ごとに再生成（app/_config/isr.ts の defaultRevalidateTime と同値）
export const revalidate = 3600;

export const metadata = buildMetadata(
  "仔犬紹介",
  "ドッグガーデンシュシュでご紹介している仔犬たちの一覧です。犬種から絞り込んでご覧いただけます。"
);

export default async function PuppiesPage() {
  const puppies = await getPuppies();

  return (
    <>
      <section className="bg-beige pb-12 pt-8">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-10 lg:px-[100px]">
          <FadeInSection>
            <SectionHeading en="PUPPY INFO" ja="仔犬紹介" />
          </FadeInSection>
          <PuppyList puppies={puppies} />
        </div>
      </section>

      <ContactSection />
      <BackLink />
    </>
  );
}
