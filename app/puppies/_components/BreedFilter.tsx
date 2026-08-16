"use client";

import { breeds } from "@/app/_model/breed";
import { trackBreedFilter } from "@/app/_lib/analytics";

type BreedFilterProps = {
  selected: string | null;
  onSelect: (breed: string | null) => void;
};

/**
 * Figma: PUPPYINFO_1 の犬種チップ
 * アクティブ: bg PINK / 非アクティブ: bg BLACK_3 opacity .3
 */
export const BreedFilter = ({ selected, onSelect }: BreedFilterProps) => (
  <ul className="flex flex-wrap items-start justify-center gap-4">
    {breeds.map((breed) => {
      const isActive = selected === breed;
      return (
        <li key={breed}>
          <button
            type="button"
            aria-pressed={isActive}
            onClick={() => {
              const next = isActive ? null : breed;
              onSelect(next);
              // 解除もどの犬種の解除か分かるように犬種名を送る
              trackBreedFilter(next ?? `${breed}（解除）`, "puppy_list");
            }}
            className={`cursor-pointer rounded-[5px] whitespace-nowrap px-6 py-[11px] font-jp lg:px-[31px] text-[14px] font-extrabold leading-[1.6] text-white shadow-btn transition-opacity md:text-[16px] ${
              isActive ? "bg-pink" : "bg-ink-light opacity-30 hover:opacity-50"
            }`}
          >
            {breed}
          </button>
        </li>
      );
    })}
  </ul>
);

export default BreedFilter;
