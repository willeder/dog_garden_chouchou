export type HeroSlide = {
  src: string;
  alt: string;
};

/** TOPヒーローの写真。microCMS連携までは静的画像を使用する */
export const heroSlides: HeroSlide[] = [
  { src: "/assets/top-puppy-photo-1.jpg", alt: "かごの中でくつろぐ仔犬" },
  { src: "/assets/top-puppy-photo-2.jpg", alt: "抱っこされている仔犬" },
  { src: "/assets/top-puppy-photo-3.jpg", alt: "こちらを見つめる仔犬" },
  { src: "/assets/top-puppy-photo-4.jpg", alt: "毛布の上の仔犬" },
  { src: "/assets/top-puppy-photo-5.jpg", alt: "おもちゃで遊ぶ仔犬" },
];
