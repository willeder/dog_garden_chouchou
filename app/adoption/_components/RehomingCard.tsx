import Image from "next/image";
import Link from "next/link";
import type { RehomingDog } from "@/app/_model/rehoming";
import { formatBirthday } from "@/app/_lib/date";

/** 里親募集カード。Figmaのカード言語（白・radius 10・shadow 5px 5px 0）に合わせる */
export const RehomingCard = ({ dog }: { dog: RehomingDog }) => (
  <li className="w-full max-w-[240px]">
    <Link
      href={`/adoption/${dog.id}`}
      className="block overflow-hidden rounded-[10px] bg-white pb-3 shadow-pop transition-opacity hover:opacity-90"
    >
      <div className="relative h-[213px] w-full">
        {dog.images[0] ? (
          <Image
            src={dog.images[0].url}
            alt={`${dog.name}の写真`}
            fill
            sizes="240px"
            className="object-cover object-top"
          />
        ) : (
          <div className="h-full w-full bg-placeholder" />
        )}
      </div>

      <div className="mx-auto mt-2 w-[213px]">
        <p className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light">
          {dog.name}
        </p>
        <p className="font-jp text-[14px] leading-[1.6] text-ink-light">
          {dog.breed}　{dog.sex}
        </p>
        <p className="font-jp text-[14px] leading-[1.6] text-ink-light">
          {formatBirthday(dog.birthday)}
        </p>
        <p className="mt-1 flex flex-wrap gap-1">
          {dog.vaccination && (
            <span className="rounded-[5px] bg-green px-2 py-[2px] font-jp text-[12px] font-extrabold leading-[1.6] text-white">
              ワクチン接種済
            </span>
          )}
          {dog.neutering && (
            <span className="rounded-[5px] bg-green-dark px-2 py-[2px] font-jp text-[12px] font-extrabold leading-[1.6] text-white">
              避妊・去勢済
            </span>
          )}
        </p>
      </div>
    </Link>
  </li>
);

export default RehomingCard;
