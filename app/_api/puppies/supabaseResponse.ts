import { Parent, Puppy, Status } from "@/app/_model/puppy";
import { Sex } from "@/app/_model/sex";
import { ImageWithSize } from "@/app/_model/image";
import { parseLocalDate } from "@/app/_lib/date";

/**
 * Supabase の v_public_puppies が返す1行。
 *
 * このビューは公開してよい列だけを持つ。
 * 匿名キーでは dogs / dog_photos を直接読めないため、公開の窓口はここだけ。
 */
export type SBPhoto = { path: string; width: number; height: number };

export type SBParent = {
  id: string;
  name: string;
  sex: string | null;
  breed: string | null;
  birthday: string | null;
  color: string | null;
  weight: number | null;
  photo: SBPhoto | null;
};

export type SBPuppy = {
  id: string;
  name: string | null;
  sex: string;
  birthday: string | null;
  status: string;
  breed_name: string;
  breed_explanation: string | null;
  color_name: string | null;
  coat_type_name: string | null;
  weight_kg: number | null;
  expected_weight_kg: number | null;
  expected_height_cm: number | null;
  list_price: number | null;
  public_message: string | null;
  created_at: string;
  photos: SBPhoto[] | null;
  mother: SBParent | null;
  father: SBParent | null;
};

/** 公開バケットの画像URL。バケットが public なので署名は不要 */
const publicImageUrl = (path: string): string => {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/dogs-public/${path}`;
};

const toImage = (p: SBPhoto): ImageWithSize => ({
  url: publicImageUrl(p.path),
  width: p.width,
  height: p.height,
});

/** 台帳は ♂ / ♀ で持つ。サイトの表記に合わせる */
const toSex = (v: string | null | undefined): Sex | undefined => {
  if (v === "♂") return "男の子";
  if (v === "♀") return "女の子";
  return undefined;
};

/**
 * 台帳のステータス → サイトの表示。
 * 「在舎」は募集中なので undefined（サイト側で未設定＝募集中の扱い）。
 */
const toStatus = (v: string): Status | undefined => {
  if (v === "商談中") return "商談中";
  if (v === "売約" || v === "引渡済") return "成約済み";
  return undefined;
};

/** 毛色と毛質を1つの文字列にまとめる（サイトの color は文字列1つ） */
const toColor = (color: string | null, coat: string | null): string =>
  [color, coat].filter(Boolean).join("・");

const toParent = (p: SBParent | null): Parent | undefined => {
  if (!p) return undefined;
  return {
    id: p.id,
    image: p.photo ? toImage(p.photo) : undefined,
    name: p.name,
    breed: p.breed ?? undefined,
    sex: toSex(p.sex),
    // 未入力の日付を parseLocalDate に渡すと Invalid Date になるためガードする
    birthday: p.birthday ? parseLocalDate(p.birthday) : undefined,
    color: p.color ?? undefined,
    weight: p.weight ?? undefined,
  };
};

export const newPuppyFromSB = (r: SBPuppy): Puppy => ({
  id: r.id,
  images: (r.photos ?? []).map(toImage),
  breed: r.breed_name,
  breedExplanation: r.breed_explanation ?? undefined,
  // 台帳側は性別必須。想定外の値が来たら女の子に倒さず落とさないため既定を置く。
  sex: toSex(r.sex) ?? "男の子",
  birthday: r.birthday ? parseLocalDate(r.birthday) : new Date(r.created_at),
  color: toColor(r.color_name, r.coat_type_name),
  expectedWeight: r.expected_weight_kg ?? undefined,
  expectedHeight: r.expected_height_cm ?? undefined,
  price: r.list_price ?? undefined,
  message: r.public_message ?? undefined,
  mother: toParent(r.mother),
  father: toParent(r.father),
  status: toStatus(r.status),
});

export const newPuppiesFromSB = (rows: SBPuppy[]): Puppy[] => rows.map(newPuppyFromSB);
