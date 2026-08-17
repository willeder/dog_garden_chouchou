import Image from "next/image";
import { breederProfile } from "@/app/_data/breederProfile";

/** Figma: ABOUTUS_3 のブリーダー紹介 */
export const BreederProfileCard = () => (
  <div className="measure-700 rounded-[30px] bg-white px-6 py-10 shadow-pop md:px-[50px] md:py-12">
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      {/* TODO: グレーの円はFigmaのプレースホルダー。実写に差し替える */}
      <Image
        src="/assets/about-breeder-avatar.svg"
        alt=""
        aria-hidden
        width={142}
        height={142}
        className="h-[120px] w-[120px] shrink-0 rounded-full md:h-[142px] md:w-[142px]"
      />
      <div className="flex flex-col items-center gap-1 sm:items-start">
        <p className="font-jp text-[12px] leading-[1.6] text-ink-light">ブリーダー</p>
        <h2 className="font-jp text-[18px] font-extrabold leading-[1.6] text-ink-light md:text-[20px]">
          {breederProfile.name}
          <span className="ml-2 font-jp text-[13px] font-medium">
            （{breederProfile.kana}）
          </span>
        </h2>
      </div>
    </div>

    <div className="mt-6 flex flex-col gap-4">
      {breederProfile.paragraphs.map((paragraph) => (
        <p
          key={paragraph}
          className="whitespace-pre-line font-jp text-[14px] leading-[1.9] text-ink-light md:text-[16px]"
        >
          {paragraph}
        </p>
      ))}
    </div>
  </div>
);

export default BreederProfileCard;
