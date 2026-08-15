import { notFound } from "next/navigation";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import PhotoGallery from "@/app/_common/PhotoGallery";
import SpecTable, { SpecRow } from "@/app/_common/ui/SpecTable";
import BackLink from "@/app/_layout/back";
import { ContactSection } from "@/app/_components/contact";
import { getRehomingDog, getRehomingDogs } from "@/app/_api/rehoming/get";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { formatBirthdayWithSuffix } from "@/app/_lib/date";

// ISR: 1時間ごとに再生成（app/_config/isr.ts の defaultRevalidateTime と同値）
export const revalidate = 3600;

type PageProps = { params: Promise<{ id: string }> };

export const generateStaticParams = async () => {
  const dogs = await getRehomingDogs();
  return dogs.map((dog) => ({ id: dog.id }));
};

export const generateMetadata = async ({ params }: PageProps) => {
  const { id } = await params;
  const dog = await getRehomingDog(id);
  if (!dog) return buildMetadata("里親募集");

  return buildMetadata(
    `${dog.name}（${dog.breed}）`,
    `${dog.breed}の${dog.sex}「${dog.name}」の里親を募集しています。`
  );
};

export default async function AdoptionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const dog = await getRehomingDog(id);

  if (!dog) notFound();

  const rows: SpecRow[] = [
    { label: "お名前", value: dog.name },
    { label: "犬種", value: dog.breed },
    { label: "性別", value: dog.sex },
    { label: "誕生日", value: formatBirthdayWithSuffix(dog.birthday) },
    { label: "毛色", value: dog.color },
    { label: "サイズ", value: dog.size },
    { label: "体重", value: `${dog.weight}kg` },
    { label: "ワクチン", value: dog.vaccination ? "接種済み" : "未接種" },
    { label: "避妊・去勢", value: dog.neutering ? "手術済み" : "未手術" },
  ];

  return (
    <>
      <section className="relative bg-blue pb-6 pt-8">
        <CloudDecoration />
        <div className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[160px]">
          <FadeInSection>
            <SectionHeading en="INFO" ja="里親募集" />
          </FadeInSection>
          <PhotoGallery images={dog.images} alt={`${dog.name}の写真`} />
        </div>
      </section>

      <section className="bg-blue pb-12">
        <FadeInSection className="mx-auto flex max-w-[1024px] justify-center px-5 md:px-[175px]">
          <SpecTable rows={rows} className="measure-700" />
        </FadeInSection>
      </section>

      {/* ブリーダーからの紹介文 */}
      <section className="bg-blue pb-20">
        <FadeInSection className="mx-auto flex max-w-[1024px] justify-center px-5 md:px-[162px]">
          <div className="measure-700 rounded-[30px] bg-white px-6 py-10 shadow-pop md:px-[50px] md:py-12">
            <h2 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
              ブリーダーからのご紹介
            </h2>
            <p className="mt-2 whitespace-pre-wrap font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
              {dog.description}
            </p>
          </div>
        </FadeInSection>
      </section>

      <ContactSection />
      <BackLink href="/adoption" />
    </>
  );
}
