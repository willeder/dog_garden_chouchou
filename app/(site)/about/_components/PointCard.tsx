import Image from "next/image";
import type { KennelPoint } from "./data";

/** Figma: ABOUTUS_2 のこだわりカード（271px幅 / アイコンが40px重なる） */
export const PointCard = ({ icon, alt, body }: KennelPoint) => (
  <li className="flex w-full max-w-[271px] flex-col items-center">
    <div className="relative z-10 -mb-10">
      <Image src={icon} alt={alt} width={80} height={80} />
    </div>
    <div className="flex w-full flex-1 items-center justify-center rounded-[10px] bg-white px-6 pb-8 pt-12 shadow-pop">
      <p className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">{body}</p>
    </div>
  </li>
);

export default PointCard;
