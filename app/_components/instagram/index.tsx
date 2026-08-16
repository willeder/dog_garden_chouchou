import Image from "next/image";
import TrackedButton from "@/app/_common/ui/TrackedButton";
import TrackedLink from "@/app/_common/ui/TrackedLink";
import FadeInSection from "@/app/_common/FadeInSection";
import { kennelInfo } from "@/app/_data/kennelInfo";

/**
 * TODO: 表示している3枚は差し替え用のサンプル画像。
 *       public/assets/top-insta-photo-1〜3.png を実際の投稿画像に置き換える。
 *       Instagram APIでの自動取得は、プロアカウント＋Metaアプリ登録＋
 *       60日ごとのトークン更新が必要なため現状は採用していない。
 */
const posts = [
  { src: "/assets/top-insta-photo-1.png", alt: "チワワの兄妹" },
  { src: "/assets/top-insta-photo-2.png", alt: "白いふわふわの仔犬" },
  { src: "/assets/top-insta-photo-3.png", alt: "毛布の上でくつろぐ仔犬" },
];

/** Figma: TOP_PC / Instagram（1024×432 / bg PINK ＋ 肉球パターン） */
export const InstagramSection = () => {
  const instagramUrl = kennelInfo.sns.instagram;

  // InstagramのURLが未設定なら、このセクション自体を出さない
  if (!instagramUrl) return null;

  return (
    <section className="paw-pattern bg-pink py-12" aria-labelledby="top-instagram-title">
      <FadeInSection className="mx-auto flex max-w-[1024px] flex-col items-center gap-6 px-5 md:px-[142px]">
        <div className="flex flex-col items-center gap-1">
          <h2
            id="top-instagram-title"
            className="font-jp text-[20px] font-extrabold leading-[1.6] text-ink-light md:text-[24px]"
          >
            Instagramも更新中！
          </h2>
          <p className="text-center font-jp text-[14px] leading-[1.6] text-ink-light">
            わんちゃんたちの日々の様子は Instagram で公開しています。
          </p>
        </div>

        <ul className="flex flex-wrap items-start justify-center gap-8">
          {posts.map((post, index) => (
            <li key={post.src} className={index === 2 ? "hidden lg:block" : ""}>
              <TrackedLink
                href={instagramUrl}
                kind="social"
                network="instagram"
                location="top_instagram_card"
                aria-label="Instagramで最新の投稿を見る"
                className="relative block h-[274px] w-[225px] bg-white shadow-pop transition-[translate] duration-300 hover:-translate-y-1"
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
                  className="absolute left-4 top-[45px] h-[193px] w-[193px] object-cover object-top"
                />
                <Image
                  src="/assets/top-insta-card-icons.svg"
                  alt=""
                  aria-hidden
                  width={198}
                  height={14}
                  className="absolute left-[14px] top-[250px]"
                />
              </TrackedLink>
            </li>
          ))}
        </ul>

        {instagramUrl && (
          <TrackedButton
            href={instagramUrl}
            kind="social"
            network="instagram"
            location="top_instagram_section"
            variant="greenDark"
            font="jp"
          >
            Instagramで最新の投稿を見る
          </TrackedButton>
        )}
      </FadeInSection>
    </section>
  );
};

export default InstagramSection;
