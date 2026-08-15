export type SpecRow = {
  label: string;
  value: string;
};

type SpecTableProps = {
  /** 左上から行方向に並ぶ（PCは2列、SPは1列） */
  rows: SpecRow[];
  className?: string;
};

/**
 * Figma: PUPPYINFO_detail_3 のスペック表
 * ラベルセル PINK / 値セル WHITE / 罫線 #7C7C7C（外枠2px・内側1px）
 */
export const SpecTable = ({ rows, className = "" }: SpecTableProps) => (
  <dl
    className={`grid grid-cols-1 border-2 border-ink-light md:grid-cols-2 ${className}`}
  >
    {rows.map((row, index) => {
      // 奇数個のときは最後の1件を2列ぶち抜きにして余白セルを作らない
      const isLastOdd = rows.length % 2 === 1 && index === rows.length - 1;
      return (
      <div
        key={`${row.label}-${index}`}
        className={`flex border-b border-ink-light last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 ${
          isLastOdd ? "md:col-span-2" : ""
        }`}
      >
        <dt className="flex w-[86px] shrink-0 items-center justify-center whitespace-nowrap border-r border-ink-light bg-pink px-3 py-4 text-center font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
          {row.label}
        </dt>
        <dd className="flex-1 bg-white py-4 pl-6 pr-4 font-jp text-[16px] leading-[1.6] text-ink-light md:text-[18px]">
          {row.value}
        </dd>
      </div>
      );
    })}
  </dl>
);

export default SpecTable;
