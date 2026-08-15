import Image from "next/image";
import SectionHeading from "@/app/_common/ui/SectionHeading";
import CloudDecoration from "@/app/_common/ui/CloudDecoration";
import FadeInSection from "@/app/_common/FadeInSection";
import BackLink from "@/app/_layout/back";
import { getVoices } from "@/app/_api/voices/get";
import { generateMetadata as buildMetadata } from "@/app/_config/metadata";

// ISR: 1時間ごとに再生成（app/_config/isr.ts の defaultRevalidateTime と同値）
export const revalidate = 3600;

export const metadata = buildMetadata(
  "お客様の声",
  "ドッグガーデンシュシュからわんちゃんをお迎えいただいたご家族の声をご紹介します。"
);

export default async function VoicePage() {
  const voices = await getVoices();

  return (
    <>
      {/* THANKYOU_1 */}
      <section className="relative bg-blue pt-8">
        <CloudDecoration />
        <FadeInSection className="relative mx-auto flex max-w-[1024px] flex-col items-center gap-4 px-5 md:px-[232px]">
          <SectionHeading en="THANK YOU" ja="お客様の声" />
          <p className="measure-560 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
            わんちゃんとの暮らしの中で感じた喜びや感動、家族として迎えた日々の幸せなエピソードをご紹介しています。
            お迎えをご検討中の方も、実際の声からわんちゃんとの暮らしをイメージしていただけたら嬉しいです。
          </p>
        </FadeInSection>
      </section>

      {/* THANKYOU_2 */}
      <section className="bg-blue pb-12 pt-8">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-[162px]">
          {voices.map((voice) => (
            <FadeInSection key={voice.id} className="w-full">
              <article className="measure-700 mx-auto rounded-[30px] bg-white px-6 py-10 shadow-pop md:px-[50px] md:py-12">
                <div className="flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-2">
                  {voice.image ? (
                    <Image
                      src={voice.image.url}
                      alt=""
                      width={142}
                      height={142}
                      className="h-[142px] w-[142px] shrink-0 rounded-full object-cover object-top"
                    />
                  ) : (
                    <div className="h-[142px] w-[142px] shrink-0 rounded-full bg-placeholder" />
                  )}
                  <div className="flex flex-col items-start gap-1">
                    <h2 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
                      {voice.title}
                    </h2>
                    <p className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
                      {voice.body}
                    </p>
                  </div>
                </div>
              </article>
            </FadeInSection>
          ))}
        </div>
      </section>

      <BackLink />
    </>
  );
}
