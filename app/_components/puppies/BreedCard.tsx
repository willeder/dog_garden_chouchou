import Image from "next/image";
import type { BreedCard as BreedCardType } from "./data";

/**
 * Figma: TOP / PUPPY INFO のカード（219.715×240.5）
 * 白いポラロイド枠＋マスクした写真＋ピンクのマスキングテープ＋犬種名
 */
export const BreedCard = ({ breed, src }: BreedCardType) => (
  <li className="relative w-[170px] shrink-0 sm:w-[200px] lg:w-[219.715px]">
    <div className="relative aspect-[219.715/240.5] w-full drop-shadow-pop">
      {/* 白いポラロイド枠 */}
      <Image
        src="/assets/top-puppy-card-frame.svg"
        alt=""
        aria-hidden
        width={220}
        height={226}
        className="absolute left-0 top-[6.245%] h-[93.76%] w-full max-w-none"
      />

      {/* 写真 */}
      <div className="absolute left-[8.88%] top-[10.81%] h-[72.67%] w-[86.69%]">
        <Image
          src={src}
          alt={breed}
          fill
          sizes="220px"
          className="mask-polaroid object-cover object-bottom"
        />
      </div>

      {/* マスキングテープ */}
      <span
        aria-hidden
        className="absolute left-[38.5%] top-[3.4%] h-[6.6%] w-[21%] rotate-[23.15deg] bg-pink"
      />

      {/* 犬種名 */}
      <p className="absolute inset-x-[9%] top-[85.24%] text-center font-jp text-[14px] font-extrabold leading-[1.6] text-ink-light lg:text-[18px]">
        {breed}
      </p>
    </div>
  </li>
);

export default BreedCard;
