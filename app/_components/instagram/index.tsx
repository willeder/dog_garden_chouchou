import Image from "next/image";
import FadeInSection from "@/app/_common/FadeInSection";
import { kennelInfo } from "@/app/_data/kennelInfo";

const posts = [
  { src: "/assets/top-insta-photo-1.png", alt: "チワワの兄妹" },
  { src: "/assets/top-insta-photo-2.png", alt: "白いふわふわの仔犬" },
  { src: "/assets/top-insta-photo-3.png", alt: "毛布の上でくつろぐ仔犬" },
];

/** Figma: TOP_PC / Instagram（1024×432 / bg PINK ＋ 肉球パターン） */
export const InstagramSection = () => (
  <section className="paw-pattern bg-pink py-12" aria-labelledby="top-instagram-title">
    <FadeInSection className="mx-auto flex max-w-[1024px] flex-col items-center gap-6 px-5 md:px-[142px]">
      <h2
        id="top-instagram-title"
        className="font-jp text-[20px] font-extrabold leading-[1.6] text-ink-light md:text-[24px]"
      >
        Instagramも更新中！
      </h2>

      <ul className="flex flex-wrap items-start justify-center gap-8">
        {posts.map((post, index) => (
          <li key={post.src} className={index === 2 ? "hidden lg:block" : ""}>
            <a
              href={kennelInfo.sns.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block h-[274px] w-[225px] bg-white shadow-pop transition-opacity hover:opacity-90"
            >
              <Image
                src="/assets/top-insta-card-header.svg"
                alt=""
                aria-hidden
                width={125}
                height={42}
                className="absolute left-1 top-0"
              />
              <Image
                src={post.src}
                alt={post.alt}
                width={193}
                height={193}
                className="absolute left-4 top-[45px] h-[193px] w-[193px] object-cover object-bottom"
              />
              <Image
                src="/assets/top-insta-card-icons.svg"
                alt=""
                aria-hidden
                width={198}
                height={14}
                className="absolute left-[14px] top-[250px]"
              />
            </a>
          </li>
        ))}
      </ul>
    </FadeInSection>
  </section>
);

export default InstagramSection;
