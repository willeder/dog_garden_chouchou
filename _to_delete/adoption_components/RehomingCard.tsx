import Image from "next/image";
import Link from "next/link";
import type { RehomingDog } from "@/app/_model/rehoming";
import { formatJpDate } from "@/app/_lib/date";

/**
 * 里親募集カード。
 * 表示項目は dog_breeder_ran の RehomingCard と同じ
 * （犬種・性別・誕生日・毛色・体重・ワクチン・去勢 ＋ 詳細を見る）。
 * 見た目はFigmaのトンマナ（白・radius 10・shadow 5px 5px 0・ピンクの罫線）。
 */
export const RehomingCard = ({ dog }: { dog: RehomingDog }) => {
  const rows = [
    { label: "犬種", value: dog.breed },
    { label: "性別", value: dog.sex },
    { label: "誕生日", value: formatJpDate(dog.birthday) },
    { label: "毛色", value: dog.color },
    { label: "体重", value: `${dog.weight}kg` },
    { label: "ワクチン", value: dog.vaccination ? "接種済み" : "未接種" },
    { label: "去勢", value: dog.neutering ? "去勢済み" : "未去勢" },
  ];

  return (
    <li>
      <Link
        href={`/adoption/${dog.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-[10px] bg-white pb-3 shadow-pop transition-opacity hover:opacity-90"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {dog.images[0] ? (
            <Image
              src={dog.images[0].url}
              alt={`${dog.breed}の写真`}
              fill
              sizes="(min-width: 1024px) 220px, (min-width: 768px) 33vw, 50vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-placeholder" />
          )}
        </div>

        <dl className="mt-2 flex flex-1 flex-col px-3">
          {rows.map((row) => (
            <div key={row.label} className="flex gap-2 border-b border-pink py-[3px]">
              <dt className="w-[3.8rem] shrink-0 font-jp text-[11px] leading-[1.6] text-ink-light">
                {row.label}
              </dt>
              <dd className="flex-1 font-jp text-[12px] font-extrabold leading-[1.6] text-ink-light">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-2 px-3 text-right font-jp text-[12px] font-extrabold leading-[1.6] text-ink-light underline underline-offset-4">
          詳細を見る ›
        </p>
      </Link>
    </li>
  );
};

export default RehomingCard;
