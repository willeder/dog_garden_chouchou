import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import FadeInSection from "@/app/_common/FadeInSection";
import PhotoGallery from "@/app/_common/PhotoGallery";
import TrackedButton from "@/app/_common/ui/TrackedButton";
import BackLink from "@/app/_layout/back";
import { ContactSection } from "@/app/_components/contact";
import { getPuppies, getPuppy } from "@/app/_api/puppies/get";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";
import { breadcrumbJsonLd, puppyJsonLd } from "@/app/_config/structuredData";
import JsonLd from "@/app/_common/JsonLd";
import { formatBirthday } from "@/app/_lib/date";
import DetailCard from "./_components/DetailCard";
import PuppySpec from "./_components/PuppySpec";
import BreederMessage from "./_components/BreederMessage";
import Parents from "./_components/Parents";
import PuppyViewTracker from "./_components/PuppyViewTracker";

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

/**
 * 仔犬詳細。ページ構成は dog_breeder_ran の PuppyDetails に合わせている。
 *   一覧に戻る → 見出し（犬種＋個体番号）→ 写真ギャラリー → 基本情報＋価格
 *   → LINE導線 → ブリーダーからのメッセージ → 両親の情報 → お問い合わせ
 */
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
      <PuppyViewTracker puppy={puppy} />

      <section className="bg-beige pb-12 pt-8">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-5 px-5 md:px-[160px]">
          <FadeInSection>
            <SectionHeading en="PUPPY INFO" ja="仔犬紹介" />
          </FadeInSection>

          {/* 一覧へ戻る導線（ran と同じくページ上部にも置く） */}
          <div className="measure-700 w-full">
            <Link
              href="/puppies"
              className="inline-flex items-center gap-1 font-jp text-[13px] font-extrabold leading-[1.6] text-ink-light underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              <Image
                src="/assets/arrow-left.svg"
                alt=""
                aria-hidden
                width={19}
                height={39}
                className="h-[11px] w-auto"
              />
              仔犬一覧に戻る
            </Link>

            {/* ページ唯一のh1。犬種と個体番号でこの子を特定できるようにする */}
            <h1 className="mt-2 font-jp text-[20px] font-extrabold leading-[1.5] text-ink-light md:text-[24px]">
              {puppy.breed}
              <span className="ml-2 font-jp text-[13px] font-medium text-ink-light md:text-[14px]">
                （お問い合わせ番号: {puppy.id}）
              </span>
            </h1>
          </div>

          <FadeInSection className="flex w-full flex-col items-center gap-3">
            <DetailCard title="写真ギャラリー" icon="/assets/icon-photo-white.svg">
              <PhotoGallery
                images={puppy.images}
                alt={`${puppy.breed}の仔犬`}
                status={puppy.status}
              />
            </DetailCard>

            <DetailCard title="基本情報" icon="/assets/paw-white.svg">
              <PuppySpec puppy={puppy} />
            </DetailCard>

            {/* 見学・お問い合わせ導線（ran と同じく価格の直後に置く） */}
            <div className="measure-700 flex w-full flex-col items-center gap-2 rounded-[30px] bg-white px-5 py-6 text-center shadow-pop md:px-8">
              <p className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[15px]">
                この子の見学・ご相談は公式LINEにて承っております
              </p>
              <TrackedButton
                href="/contact"
                kind="cta"
                location="puppy_detail"
                label="LINEで見学予約・お問い合わせ"
                variant="green"
                font="jp"
                className="w-full"
              >
                LINEで見学予約・お問い合わせ
              </TrackedButton>
            </div>

            {/* メッセージ未入力の子は、見出しだけのカードが残らないよう非表示にする */}
            {puppy.message && (
              <DetailCard title="ブリーダーからのメッセージ" icon="/assets/icon-message-white.svg">
                <BreederMessage message={puppy.message} />
              </DetailCard>
            )}

            <DetailCard title="両親の情報" icon="/assets/paw-white.svg">
              <Parents father={puppy.father} mother={puppy.mother} />
            </DetailCard>
          </FadeInSection>
        </div>
      </section>

      <ContactSection location="puppy_detail_bottom" />
      <BackLink href="/puppies" />
    </>
  );
}
