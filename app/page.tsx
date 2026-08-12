import { HeroSection } from "./_components/hero";
import { PuppiesSection } from "./_components/puppies";
import { AdoptionSection } from "./_components/adoption";
import { VoiceSection } from "./_components/voice";
import { InstagramSection } from "./_components/instagram";
import { ContactSection } from "./_components/contact";

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

      {/* Instagram */}
      <InstagramSection />

      {/* CONTACT US（お問い合わせ） */}
      <ContactSection />
    </>
  );
}
