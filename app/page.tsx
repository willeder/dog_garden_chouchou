import { HeroSection } from "./_components/hero";
import { PuppiesSection } from "./_components/puppies";
import { AdoptionSection } from "./_components/adoption";
import { VoiceSection } from "./_components/voice";
import { LinksSection } from "./_components/links";
import { ContactSection } from "./_components/contact";
import { InstagramSection } from "./_components/instagram";

// ISR: 1時間ごとに再生成（app/_config/isr.ts の defaultRevalidateTime と同値）
export const revalidate = 3600;

/**
 * セクションの並びは dog_breeder_ran のTOP（Hero → About → 子犬 → リンク集 → お問い合わせ → SNS）に準拠。
 * 各セクションの見た目はFigma（TOP_PC）に準拠。
 */
export default function Home() {
  return (
    <>
      {/* ヒーロー ＋ ABOUT US */}
      <HeroSection />

      {/* PUPPY INFO（仔犬紹介） */}
      <PuppiesSection />

      {/* INFO（里親のお迎えについて） */}
      <AdoptionSection />

      {/* THANK YOU（お客様の声） */}
      <VoiceSection />

      {/* 各ページへのリンク集 ＋ 見学のお申し込み */}
      <LinksSection />

      {/* CONTACT US（お問い合わせ） */}
      <ContactSection location="top_contact" />

      {/* SNS（Instagram） */}
      <InstagramSection />
    </>
  );
}
