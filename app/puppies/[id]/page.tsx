import { notFound } from "next/navigation";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { ContactSection } from "@/app/_components/contact";
import { getPuppies, getPuppy } from "@/app/_api/puppies/get";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { formatBirthday } from "@/app/_lib/date";
import PuppyGallery from "./_components/PuppyGallery";
import PuppySpec from "./_components/PuppySpec";

// ISR: 1時間ごとに再生成（app/_config/isr.ts の defaultRevalidateTime と同値）
export const revalidate = 3600;

type PageProps = { params: Promise<{ id: string }> };

export const generateStaticParams = async () => {
  const puppies = await getPuppies();
  return puppies.map((puppy) => ({ id: puppy.id }));
};

export const generateMetadata = async ({ params }: PageProps) => {
  const { id } = await params;
  const puppy = await getPuppy(id);
  if (!puppy) return buildMetadata("仔犬紹介");

  return buildMetadata(
    `${puppy.breed}（${puppy.sex}）`,
    `${puppy.breed}の${puppy.sex}。${formatBirthday(puppy.birthday)}。毛色は${puppy.color}です。`
  );
};

export default async function PuppyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const puppy = await getPuppy(id);

  if (!puppy) notFound();

  return (
    <>
      <section className="bg-beige pb-6 pt-8">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[160px]">
          <FadeInSection>
            <SectionHeading en="PUPPY INFO" ja="仔犬紹介" />
          </FadeInSection>
          <PuppyGallery images={puppy.images} alt={`${puppy.breed}の仔犬`} />
        </div>
      </section>

      <section className="bg-beige pb-20">
        <FadeInSection className="mx-auto flex max-w-[1024px] justify-center px-5 md:px-[175px]">
          <dl className="w-full max-w-[700px]">
            <PuppySpec puppy={puppy} />
          </dl>
        </FadeInSection>
      </section>

      <ContactSection />
      <BackLink href="/puppies" />
    </>
  );
}
