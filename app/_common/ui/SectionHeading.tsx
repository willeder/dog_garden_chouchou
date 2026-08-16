import Image from "next/image";

type SectionHeadingProps = {
  /** 骨型プレート内の英字（例: ABOUT US） */
  en: string;
  /** プレート下の日本語見出し（例: ドッグガーデンシュシュについて） */
  ja?: string;
  /**
   * 見出しレベル。各ページの先頭の見出しだけ "h1" にする。
   * SEO上、1ページに h1 は1つだけ置き、そのページの主題を表す語を含める。
   */
  as?: "h1" | "h2";
  className?: string;
};

/**
 * 骨型プレート＋英字＋日本語見出しの共通セクションタイトル。
 * Figma: base/Frame 21（328×67のプレート、影込みの実寸は334×73）
 */
export const SectionHeading = ({
  en,
  ja,
  as: Heading = "h2",
  className = "",
}: SectionHeadingProps) => (
  <div className={`flex flex-col items-center ${className}`}>
    <div className="relative h-[55px] w-[270px] sm:h-[67px] sm:w-[328px]">
      {/* プレートは影の分だけ外側にはみ出す（Figma: inset -1.49% -0.91% -7.46%） */}
      <Image
        src="/assets/bone-plate.svg"
        alt=""
        width={334}
        height={73}
        aria-hidden
        className="absolute -left-[0.91%] -top-[1.49%] h-[108.96%] w-[101.83%] max-w-none"
      />
      <span className="absolute inset-0 flex items-center justify-center font-en text-[20px] leading-none text-ink-light sm:text-[24px]">
        {en}
      </span>
    </div>
    {ja && (
      <Heading className="text-center font-jp text-[20px] font-extrabold leading-[1.6] text-ink-light sm:text-[24px]">
        {ja}
      </Heading>
    )}
  </div>
);

export default SectionHeading;
