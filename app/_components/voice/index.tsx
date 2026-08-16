import SectionHeading from "@/app/_common/ui/SectionHeading";
import FadeInSection from "@/app/_common/FadeInSection";
import { getVoices } from "@/app/_api/voices/get";
import VoiceCarousel from "./VoiceCarousel";

/** Figma: TOP_PC / THANKYOU（1024×554 / bg BEIGE） */
export const VoiceSection = async () => {
  const voices = await getVoices();

  // お客様の声が1件も無いときは、見出しだけが残らないようセクションごと出さない
  if (voices.length === 0) return null;

  return (
    <section className="bg-beige pb-20" aria-labelledby="top-voice-title">
      <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-[74px]">
        <FadeInSection className="flex flex-col items-center">
          <SectionHeading en="THANK YOU" ja="お客様の声" />
          <p
            id="top-voice-title"
            className="measure-560 mt-2 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]"
          >
            里親さんや飼い主さんから届いた、わんちゃんとの暮らしのエピソードをご紹介します。
            毎日の楽しい時間や成長の様子を聞くたびに、私たちもとても嬉しい気持ちになります。
            お迎えを考えている方は、ぜひ参考にしてみてくださいね。
          </p>
        </FadeInSection>

        <VoiceCarousel voices={voices} />
      </div>
    </section>
  );
};

export default VoiceSection;
