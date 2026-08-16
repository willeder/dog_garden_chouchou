import { notFound } from "next/navigation";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import FadeInSection from "@/app/_common/FadeInSection";
import PhotoGallery from "@/app/_common/PhotoGallery";
import Button from "@/app/_common/ui/Button";
import BackLink from "@/app/_layout/back";
import { ContactSection } from "@/app/_components/contact";
import { getPuppies, getPuppy } from "@/app/_api/puppies/get";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { breadcrumbJsonLd, puppyJsonLd } from "@/app/_config/structuredData";
import JsonLd from "@/app/_common/JsonLd";
import { formatBirthday } from "@/app/_lib/date";
import PuppySpec from "./_components/PuppySpec";
import BreederMessage from "./_components/BreederMessage";
import Parents from "./_components/Parents";

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
  if (!puppy) return buildMetadata("仔犬紹介", undefined, "/puppies");

  return buildMetadata(
    `${puppy.breed}（${puppy.sex}）`,
    `福岡県筑紫野市のブリーダー「ドッグガーデンシュシュ」の${puppy.breed}の${puppy.sex}です。${formatBirthday(puppy.birthday)}、毛色は${puppy.color}。見学・お迎えのご相談は公式LINEにて承ります。`,
    `/puppies/${id}`
  );
};

export default async function PuppyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const puppy = await getPuppy(id);

  if (!puppy) notFound();

  return (
    <>
      <JsonLd
        data={[
          puppyJsonLd(puppy),
          breadcrumbJsonLd([
            { name: "仔犬紹介", path: "/puppies" },
            { name: `${puppy.breed}（${puppy.sex}）`, path: `/puppies/${puppy.id}` },
          ]),
        ]}
      />

      {/* 写真 */}
      <section className="bg-beige pb-6 pt-8">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[160px]">
          <FadeInSection>
            <SectionHeading en="PUPPY INFO" ja="仔犬紹介" />
          </FadeInSection>
          <PhotoGallery
            images={puppy.images}
            alt={`${puppy.breed}の仔犬`}
            status={puppy.status}
          />
        </div>
      </section>

      {/* 基本情報 */}
      <section className="bg-beige pb-8">
        <FadeInSection className="mx-auto flex max-w-[1024px] justify-center px-5 md:px-[175px]">
          <PuppySpec puppy={puppy} />
        </FadeInSection>
      </section>

      {/* 見学・お問い合わせ導線（価格の近くに置く） */}
      <section className="bg-beige pb-12">
        <FadeInSection className="mx-auto flex max-w-[1024px] flex-col items-center gap-3 px-5 md:px-[175px]">
          <p className="text-center font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
            この子の見学・ご相談は公式LINEにて承っております。
          </p>
          <Button href="/contact" variant="green" font="jp">
            LINEで見学・お問い合わせ
          </Button>
        </FadeInSection>
      </section>

      {/* ブリーダーからのメッセージ */}
      <section className="bg-beige pb-8">
        <FadeInSection className="mx-auto flex max-w-[1024px] justify-center px-5 md:px-[162px]">
          <BreederMessage message={puppy.message} />
        </FadeInSection>
      </section>

      {/* 両親の情報 */}
      <section className="bg-beige pb-20">
        <FadeInSection className="mx-auto flex max-w-[1024px] justify-center px-5 md:px-[162px]">
          <Parents father={puppy.father} mother={puppy.mother} />
        </FadeInSection>
      </section>

      <ContactSection />
      <BackLink href="/puppies" />
    </>
  );
}
