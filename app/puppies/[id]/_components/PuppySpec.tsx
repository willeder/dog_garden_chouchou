import SpecTable, { SpecRow } from "@/app/_common/ui/SpecTable";
import type { Puppy } from "@/app/_model/puppy";
import { formatAge, formatBirthdayWithSuffix } from "@/app/_lib/date";
import { formatPrice } from "@/app/_lib/format";

/**
 * 基本情報（Figma: PUPPYINFO_detail_3 のスペック表）
 * 項目は dog_breeder_ran の Details と同じ
 */
export const PuppySpec = ({ puppy }: { puppy: Puppy }) => {
  const rows: SpecRow[] = [
    { label: "犬種", value: puppy.breed },
    { label: "性別", value: puppy.sex },
    { label: "誕生日", value: formatBirthdayWithSuffix(puppy.birthday) },
    { label: "生後", value: formatAge(puppy.birthday) },
    { label: "毛色", value: puppy.color },
  ];

  // 成約済みの子は価格の行そのものを出さない
  if (puppy.status !== "成約済み") {
    rows.push({
      label: "価格",
      value: puppy.price != null ? `${formatPrice(puppy.price)}(税込)` : "応相談",
    });
  }

  if (puppy.expectedWeight != null) {
    rows.push({ label: "予想体重", value: `${puppy.expectedWeight}kg以下` });
  }
  if (puppy.expectedHeight != null) {
    rows.push({ label: "予想体高", value: `${puppy.expectedHeight}cm以下` });
  }

  return (
    <div className="measure-700 flex flex-col gap-3">
      {/* ページ唯一のh1。この個体が何の犬かを検索エンジンとユーザーの両方に示す */}
      <h1 className="font-jp text-[18px] font-extrabold leading-[1.6] text-ink-light md:text-[22px]">
        {puppy.breed}（{puppy.sex}）
      </h1>
      <SpecTable rows={rows} />
      {puppy.breedExplanation && (
        <p className="font-jp text-[14px] leading-[1.6] text-ink-light">
          {puppy.breedExplanation}
        </p>
      )}
    </div>
  );
};

export default PuppySpec;
