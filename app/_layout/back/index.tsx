import Image from "next/image";
import Link from "next/link";

type BackLinkProps = {
  /** 戻り先。既定はトップページ */
  href?: string;
};

/**
 * Figma: base/BACK（1024×122 / bg BLUE #EAF1F2）
 * 犬アイコン＋「BACK」＋下線
 */
export const BackLink = ({ href = "/" }: BackLinkProps) => (
  <div className="bg-blue py-12">
    <div className="mx-auto max-w-[1024px] px-5 md:px-[160px]">
      <Link
        href={href}
        className="inline-flex flex-col items-center gap-[2px] transition-opacity hover:opacity-70"
      >
        <span className="flex items-end justify-end gap-1">
          <Image src="/assets/common-back-dog.svg" alt="" aria-hidden width={22} height={20} />
          <span className="font-en text-[24px] leading-none text-ink-light">BACK</span>
        </span>
        <span aria-hidden className="block h-px w-[112px] bg-ink-light" />
      </Link>
    </div>
  </div>
);

export default BackLink;
