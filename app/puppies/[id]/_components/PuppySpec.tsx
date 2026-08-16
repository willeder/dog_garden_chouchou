import type { Puppy } from "@/app/_model/puppy";
import { formatAge, formatDay, formatMonth, formatYear } from "@/app/_lib/date";
import { formatPrice } from "@/app/_lib/format";

type Cell = {
  label: string;
  value: React.ReactNode;
  /** 犬種セルのように2列ぶち抜きにする項目 */
  wide?: boolean;
};

/**
 * 基本情報。項目とレイアウト（2〜3列のカード＋価格を下部に大きく）は
 * dog_breeder_ran の details.tsx に合わせている。
 */
export const PuppySpec = ({ puppy }: { puppy: Puppy }) => {
  const cells: Cell[] = [
    {
      label: "犬種",
      wide: true,
      value: (
        <span className="flex flex-col">
          {puppy.breed}
          {puppy.breedExplanation && (
            <span className="font-jp text-[11px] font-medium leading-[1.6] text-ink-light">
              {puppy.breedExplanation}
            </span>
          )}
        </span>
      ),
    },
    { label: "性別", value: puppy.sex },
    {
      label: "誕生日",
      value: (
        <>
          {formatYear(puppy.birthday)}
          <span className="text-[11px]">年 </span>
          {formatMonth(puppy.birthday)}
          <span className="text-[11px]">月 </span>
          {formatDay(puppy.birthday)}
          <span className="text-[11px]">日</span>
        </>
      ),
    },
    { label: "生後", value: formatAge(puppy.birthday) },
    { label: "毛色", value: puppy.color },
  ];

  if (puppy.expectedWeight != null) {
    cells.push({
      label: "成犬時予想体重",
      value: (
        <>
          {puppy.expectedWeight}
          <span className="text-[12px]"> kg以下</span>
        </>
      ),
    });
  }
  if (puppy.expectedHeight != null) {
    cells.push({
      label: "成犬時予想体高",
      value: (
        <>
          {puppy.expectedHeight}
          <span className="text-[12px]"> cm以下</span>
        </>
      ),
    });
  }

  // 成約済みの子は価格を表示しない
  const showPrice = puppy.status !== "成約済み";

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cells.map((cell) => (
          <dl
            key={cell.label}
            className={`rounded-[8px] border border-pink bg-beige px-3 py-2 ${
              cell.wide ? "col-span-2" : ""
            }`}
          >
            <dt className="font-jp text-[12px] leading-[1.6] text-ink-light">{cell.label}</dt>
            <dd className="mt-[2px] font-jp text-[14px] font-extrabold leading-[1.6] text-ink-light md:text-[15px]">
              {cell.value}
            </dd>
          </dl>
        ))}
      </div>

      {showPrice && (
        <dl className="mt-4 flex flex-col px-1">
          <dt className="font-jp text-[13px] leading-[1.6] text-ink-light">価格</dt>
          <dd className="border-b-2 border-dashed border-pink pb-1 font-jp text-[24px] font-extrabold leading-[1.4] text-ink-light">
            {puppy.price != null ? (
              <>
                {puppy.price.toLocaleString("ja-JP")}
                <span className="ml-1 text-[14px]">円（税込）</span>
              </>
            ) : (
              <span className="text-[18px]">{formatPrice(undefined)}</span>
            )}
          </dd>
        </dl>
      )}
    </>
  );
};

export default PuppySpec;
