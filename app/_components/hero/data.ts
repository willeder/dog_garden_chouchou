export type HeroSlide = {
  src: string;
  alt: string;
};

/** TOPヒーローの写真。microCMS連携までは静的画像を使用する */
export const heroSlides: HeroSlide[] = [
  { src: "/assets/top-puppy-photo-3.jpg", alt: "こちらを見つめるチワワの仔犬" },
  { src: "/assets/top-puppy-photo-5.jpg", alt: "トイプードルの仔犬" },
  { src: "/assets/top-puppy-photo-2.jpg", alt: "おもちゃで遊ぶ仔犬" },
  { src: "/assets/top-puppy-photo-4.jpg", alt: "ビションフリーゼの仔犬" },
  { src: "/assets/top-puppy-photo-1.jpg", alt: "マルチーズの仔犬" },
];
