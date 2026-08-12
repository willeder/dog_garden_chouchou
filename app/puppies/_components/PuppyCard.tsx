import Image from "next/image";
import Link from "next/link";
import type { Puppy } from "@/app/_model/puppy";
import { formatBirthday } from "@/app/_lib/date";

/** Figma: PUPPYINFO_2 のカード（240×273 / radius 10 / shadow 5px 5px 0） */
export const PuppyCard = ({ puppy }: { puppy: Puppy }) => (
  <li className="w-full max-w-[240px]">
    <Link
      href={`/puppies/${puppy.id}`}
      className="block overflow-hidden rounded-[10px] bg-white pb-2 shadow-pop transition-opacity hover:opacity-90"
    >
      <div className="relative h-[213px] w-full">
        {puppy.images[0] ? (
          <Image
            src={puppy.images[0].url}
            alt={`${puppy.breed}の仔犬`}
            fill
            sizes="240px"
            className="object-cover object-bottom"
          />
        ) : (
          <div className="h-full w-full bg-placeholder" />
        )}
      </div>
      <div className="mx-auto mt-2 w-[213px] font-jp text-[14px] leading-[1.6] text-ink-light">
        <p>
          {puppy.breed}　{puppy.sex}
        </p>
        <p>{formatBirthday(puppy.birthday)}</p>
      </div>
    </Link>
  </li>
);

export default PuppyCard;
