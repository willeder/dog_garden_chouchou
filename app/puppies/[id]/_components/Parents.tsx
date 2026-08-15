import Image from "next/image";
import type { Parent } from "@/app/_model/puppy";

type ParentType = "father" | "mother";

const labels: Record<ParentType, string> = { father: "パパ", mother: "ママ" };

const ParentCard = ({ parent, type }: { parent?: Parent; type: ParentType }) => (
  <div className="overflow-hidden rounded-[10px] bg-beige">
    <div className="relative aspect-[4/3] w-full">
      {parent ? (
        <Image
          src={parent.image.url}
          alt={`${labels[type]}の写真`}
          fill
          sizes="(min-width: 768px) 300px, 100vw"
          className="object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-placeholder px-4 text-center">
          <p className="font-jp text-[12px] leading-[1.6] text-white">
            {labels[type]}の情報は登録されていません
          </p>
        </div>
      )}
      <span className="absolute left-0 top-0 rounded-br-[10px] bg-pink px-3 py-1 font-jp text-[12px] font-extrabold leading-[1.6] text-white">
        {labels[type]}
      </span>
    </div>

    {parent && (
      <dl className="px-4 py-3">
        {[
          { label: "お名前", value: parent.name },
          { label: "犬種", value: parent.breed },
          { label: "毛色", value: parent.color },
          { label: "体重", value: `${parent.weight}kg` },
        ].map((row) => (
          <div key={row.label} className="flex gap-2 border-b border-pink py-[2px] last:border-b-0">
            <dt className="w-[3.5rem] shrink-0 font-jp text-[12px] leading-[1.6] text-ink-light">
              {row.label}
            </dt>
            <dd className="flex-1 font-jp text-[13px] font-extrabold leading-[1.6] text-ink-light">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    )}
  </div>
);

/** 両親の情報（ran の parents.tsx 相当） */
export const Parents = ({ father, mother }: { father?: Parent; mother?: Parent }) => (
  <div className="measure-700 rounded-[30px] bg-white px-6 py-10 shadow-pop md:px-[50px] md:py-12">
    <h2 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
      両親の情報
    </h2>

    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <ParentCard parent={father} type="father" />
      <ParentCard parent={mother} type="mother" />
    </div>

    <p className="mt-6 rounded-[10px] border-2 border-dashed border-pink px-4 py-4 text-center font-jp text-[14px] font-extrabold leading-[1.6] text-ink-light">
      親犬のお引き渡しはできませんのでご注意ください
    </p>
  </div>
);

export default Parents;
