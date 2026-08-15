import Image from "next/image";
import Link from "next/link";
import StatusBadge from "@/app/_common/ui/StatusBadge";
import type { Puppy } from "@/app/_model/puppy";
import { formatAge, formatJpDate } from "@/app/_lib/date";
import { formatPrice } from "@/app/_lib/format";

type Row = { label: string; value: string; accent?: boolean };

/**
 * Figma のカード（240×273 / 白 / radius 10 / shadow 5px 5px 0）に、
 * dog_breeder_ran と同じ項目（犬種・性別・誕生日・生後・毛色・価格）を載せたもの
 */
export const PuppyCard = ({ puppy }: { puppy: Puppy }) => {
  const rows: Row[] = [
    { label: "犬種", value: puppy.breed },
    { label: "性別", value: puppy.sex },
    { label: "誕生日", value: formatJpDate(puppy.birthday) },
    { label: "生後", value: formatAge(puppy.birthday) },
    { label: "毛色", value: puppy.color },
  ];
  if (puppy.price != null) {
    rows.push({ label: "価格", value: `${formatPrice(puppy.price)}(税込)`, accent: true });
  }

  return (
    <li className="w-full max-w-[240px]">
      <Link
        href={`/puppies/${puppy.id}`}
        className="group block overflow-hidden rounded-[10px] bg-white pb-3 shadow-pop transition-opacity hover:opacity-90"
      >
        <div className="relative h-[213px] w-full overflow-hidden">
          {puppy.images[0] ? (
            <Image
              src={puppy.images[0].url}
              alt={`${puppy.breed}の仔犬`}
              fill
              sizes="240px"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-placeholder" />
          )}
          {puppy.status && <StatusBadge status={puppy.status} />}
        </div>

        <dl className="mx-auto mt-2 w-[213px]">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex gap-2 border-b border-pink py-[2px] last:border-b-0"
            >
              <dt className="w-[3.5rem] shrink-0 font-jp text-[12px] leading-[1.6] text-ink-light">
                {row.label}
              </dt>
              <dd
                className={`flex-1 font-jp text-[13px] font-extrabold leading-[1.6] ${
                  row.accent ? "text-green-dark" : "text-ink-light"
                }`}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mx-auto mt-2 w-[213px] text-right font-jp text-[12px] font-extrabold leading-[1.6] text-ink-light underline underline-offset-4">
          詳細を見る ›
        </p>
      </Link>
    </li>
  );
};

export default PuppyCard;
