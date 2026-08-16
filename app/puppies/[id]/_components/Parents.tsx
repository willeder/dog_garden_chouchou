import Image from "next/image";
import type { Parent } from "@/app/_model/puppy";

type ParentType = "father" | "mother";

const labels: Record<ParentType, string> = { father: "パパ", mother: "ママ" };

/** 未設定の親犬。ran と同じく枠だけ残して「設定されていない」ことを明示する */
const UndefinedParent = ({ type }: { type: ParentType }) => (
  <div className="overflow-hidden rounded-[10px] border border-pink bg-beige">
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-placeholder/40 px-4">
      <p className="text-center font-jp text-[12px] leading-[1.6] text-ink-light">
        {type === "father" ? "お父さん犬" : "お母さん犬"}の情報は
        <br />
        登録されていません
      </p>
    </div>
  </div>
);

const ParentInfo = ({ parent, type }: { parent: Parent; type: ParentType }) => {
  // microCMS側で未入力の項目は行ごと出さない（"undefined kg" のような表示を防ぐ）
  const rows = [
    { label: "犬種", value: parent.breed },
    { label: "毛色", value: parent.color },
    { label: "体重", value: parent.weight != null ? `${parent.weight} kg` : undefined },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));

  return (
    <div className="overflow-hidden rounded-[10px] border border-pink bg-beige">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {parent.image ? (
          <Image
            src={parent.image.url}
            alt={type === "father" ? "父犬の写真" : "母犬の写真"}
            fill
            sizes="(min-width: 640px) 320px, 100vw"
            className="object-cover object-center"
            draggable={false}
          />
        ) : (
          <div className="h-full w-full bg-placeholder/40" />
        )}
        <span className="absolute left-0 top-0 rounded-br-[10px] bg-pink px-3 py-1 font-jp text-[12px] font-extrabold leading-[1.6] text-white">
          {labels[type]}
        </span>
      </div>

      {rows.length > 0 && (
        <dl className="p-3">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-3 items-end border-b border-pink py-1 last:border-b-0"
            >
              <dt className="font-jp text-[11px] leading-[1.6] text-ink-light">{row.label}</dt>
              <dd className="col-span-2 font-jp text-[13px] font-extrabold leading-[1.6] text-ink-light">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

/** 両親の情報（dog_breeder_ran の parents.tsx と同じ項目・同じ注意書き） */
export const Parents = ({ father, mother }: { father?: Parent; mother?: Parent }) => (
  <>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {father ? <ParentInfo parent={father} type="father" /> : <UndefinedParent type="father" />}
      {mother ? <ParentInfo parent={mother} type="mother" /> : <UndefinedParent type="mother" />}
    </div>

    <p className="mt-4 rounded-[10px] border-2 border-dashed border-pink px-4 py-5 text-center font-jp text-[14px] font-extrabold leading-[1.6] text-ink-light">
      親犬は引き渡しができませんのでご注意ください
    </p>
  </>
);

export default Parents;
