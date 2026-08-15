import Image from "next/image";
import Link from "next/link";
import type { Breed } from "@/app/_model/breed";

export type BreedCardProps = {
  breed: Breed;
  /** 代表写真。microCMSに該当犬種の仔犬がいればその写真、無ければ静的画像 */
  src: string;
  /** 該当犬種の掲載件数 */
  count: number;
};

/**
 * Figma: TOP / PUPPY INFO のポラロイド風カード（219.715×240.5）
 * クリックすると仔犬一覧をその犬種で絞り込んだ状態で開く
 */
export const BreedCard = ({ breed, src, count }: BreedCardProps) => (
  <li className="relative w-[170px] shrink-0 sm:w-[200px] lg:w-[219.715px]">
    <Link
      href={`/puppies?breed=${encodeURIComponent(breed)}`}
      aria-label={`${breed}の仔犬一覧を見る`}
      className="block transition-transform duration-300 hover:-translate-y-1"
    >
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
            alt=""
            fill
            sizes="220px"
            className="mask-polaroid object-cover object-top"
          />
        </div>

        {/* マスキングテープ */}
        <span
          aria-hidden
          className="absolute left-[38.5%] top-[3.4%] h-[6.6%] w-[21%] rotate-[23.15deg] bg-pink"
        />

        {/* 犬種名（掲載中の頭数があれば併記） */}
        <p className="absolute inset-x-[9%] top-[85.24%] text-center font-jp text-[14px] font-extrabold leading-[1.6] text-ink-light lg:text-[18px]">
          {breed}
          {count > 0 && (
            <span className="ml-1 font-jp text-[11px] font-medium lg:text-[12px]">
              ({count})
            </span>
          )}
        </p>
      </div>
    </Link>
  </li>
);

export default BreedCard;
