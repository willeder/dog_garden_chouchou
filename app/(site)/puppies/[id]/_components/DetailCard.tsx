import Image from "next/image";
import React from "react";

type DetailCardProps = {
  /** カードの見出し（写真ギャラリー / 基本情報 など） */
  title: string;
  /** 見出し左の丸アイコンに入れるSVGのパス */
  icon: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * 仔犬詳細の各ブロックの共通カード。
 * 構成は dog_breeder_ran の PuppyDetails（丸アイコン＋見出し＋白カード）に合わせ、
 * 見た目は chouchou のトンマナ（radius 30 / shadow-pop / PINK）にしている。
 */
export const DetailCard = ({ title, icon, children, className = "" }: DetailCardProps) => (
  <section
    className={`measure-700 w-full rounded-[30px] bg-white px-5 py-6 shadow-pop md:px-8 md:py-8 ${className}`}
  >
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink">
        <Image src={icon} alt="" aria-hidden width={22} height={22} className="h-[20px] w-auto" />
      </span>
      <h2 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
        {title}
      </h2>
    </div>
    {children}
  </section>
);

export default DetailCard;
