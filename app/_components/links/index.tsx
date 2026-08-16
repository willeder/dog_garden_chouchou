import Image from "next/image";
import Link from "next/link";
import TrackedButton from "@/app/_common/ui/TrackedButton";
import FadeInSection from "@/app/_common/FadeInSection";

const links = [
  {
    href: "/warranty",
    title: "生体保証について",
    body: "安心してお迎えいただけるよう、すべての仔犬に生体保証をお付けしています。",
  },
  {
    href: "/faq",
    title: "よくある質問",
    body: "お迎えの流れやお世話のことなど、よくいただくご質問をまとめました。",
  },
];

/**
 * dog_breeder_ran の LinksSection 相当。
 * 下層ページへの導線をまとめ、最後に見学のお申し込みボタンを置く。
 */
export const LinksSection = () => (
  <section className="bg-beige pb-20" aria-labelledby="top-links">
    <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-8 px-5 md:px-[130px]">
      <h2 id="top-links" className="sr-only">
        各ページのご案内
      </h2>

      <FadeInSection className="w-full">
        <ul className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex h-full flex-col gap-2 rounded-[30px] bg-white px-6 py-8 shadow-pop transition-opacity hover:opacity-90 md:px-8"
              >
                <h3 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
                  {link.title}
                </h3>
                <p className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
                  {link.body}
                </p>
                <span className="mt-auto pt-3 text-right font-jp text-[12px] font-extrabold leading-[1.6] text-ink-light underline underline-offset-4">
                  詳しく見る ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </FadeInSection>

      <FadeInSection className="flex flex-col items-center gap-4">
        <Image
          src="/assets/top-puppy-dogs-group.svg"
          alt=""
          aria-hidden
          width={166}
          height={130}
          className="h-auto w-[130px]"
        />
        <TrackedButton href="/visit" kind="cta" location="top_links" label="見学のお申し込みはこちらから" variant="green" font="jp" className="px-10 py-4 text-[16px]">
          見学のお申し込みはこちらから
        </TrackedButton>
      </FadeInSection>
    </div>
  </section>
);

export default LinksSection;
