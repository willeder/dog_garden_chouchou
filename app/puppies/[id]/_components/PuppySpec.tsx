import type { Puppy } from "@/app/_model/puppy";
import { formatBirthdayWithSuffix } from "@/app/_lib/date";
import { formatPrice } from "@/app/_lib/format";

/**
 * Figma: PUPPYINFO_detail_3（2列×3行 / ラベルセルPINK・値セルWHITE / 罫線 #7C7C7C）
 */
export const PuppySpec = ({ puppy }: { puppy: Puppy }) => {
  const rows: [string, string][][] = [
    [
      ["犬種", puppy.breed],
      ["性別", puppy.sex],
    ],
    [
      ["誕生日", formatBirthdayWithSuffix(puppy.birthday)],
      ["毛色", puppy.color],
    ],
    [
      ["価格", formatPrice(puppy.price)],
      ["特徴", puppy.feature ?? "―"],
    ],
  ];

  return (
    <div className="measure-700 grid grid-cols-1 border-2 border-ink-light md:grid-cols-2">
      {rows.flat().map(([label, value], index) => (
        <div
          key={`${label}-${index}`}
          className="flex border-b border-ink-light last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0"
        >
          <dt className="flex w-[86px] shrink-0 items-center justify-center whitespace-nowrap border-r border-ink-light bg-pink px-3 py-4 text-center font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
            {label}
          </dt>
          <dd className="flex-1 bg-white py-4 pl-6 pr-4 font-jp text-[16px] leading-[1.6] text-ink-light md:text-[18px]">
            {value}
          </dd>
        </div>
      ))}
    </div>
  );
};

export default PuppySpec;
