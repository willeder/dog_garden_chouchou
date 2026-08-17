// Supabase の実スキーマから起こした型。
// 全量は `supabase gen types` で出せるが、アプリが実際に使う行だけを持つ。

export type DogStatus =
  | '在舎' | '商談中' | '売約' | '引渡済' | '在籍' | '退役' | '預託' | '死亡';

export type DeliveryMethod = '自然' | '帝王切開' | '後帝';

export type BreedCode = 'TP' | 'ML' | 'CI' | 'BFR' | 'PO';

export type Breed = {
  code: string;
  name: string;
  hex: string;
};

export type CoatColor = {
  code: string;
  name: string;
  hex: string;
  hex2: string | null;
};

/** 犬一覧の1行。dogs に関連マスタと集計を結合したもの */
export type DogListRow = {
  id: string;
  name: string;
  sex: string;
  breed_code: string;
  birthday: string | null;
  weight_kg: number | null;
  microchip: string | null;
  color_code: string | null;
  coat_type_code: string | null;
  status: DogStatus;
  is_external: boolean;
  breeds: Breed | null;
  coat_colors: CoatColor | null;
};

/** 犬一覧の1行 ＋ 出産集計（母犬のみ値が入る） */
export type DogListItem = DogListRow & {
  litter_count: number;
  last_birth_date: string | null;
  next_mating_month: string | null;
};

export type DogDetail = DogListRow & {
  color: string | null;
  genes: string[] | null;
  breeder_note: string | null;
  is_self_bred: boolean;
  acquired_on: string | null;
  died_on: string | null;
  note: string | null;
  sire_id: string | null;
  dam_id: string | null;
  coat_types: { code: string; name: string } | null;
  breeder: { name: string; contact_name: string | null; license_no: string | null } | null;
  supplier: { name: string; contact_name: string | null; license_no: string | null } | null;
};

export type LitterRow = {
  id: string;
  birth_date: string;
  sire_id: string | null;
  sire_name: string | null;
  gestation_days: number | null;
  method: DeliveryMethod | null;
  male_count: number;
  female_count: number;
  stillborn_count: number;
  note: string | null;
  checkup_date: string | null;
  is_mix: boolean | null;
};

export type VaccinationRow = {
  id: string;
  kind: string;
  dosed_on: string;
  note: string | null;
};

export type VaccineDueRow = {
  kind: string;
  last_dosed_on: string | null;
  next_due_on: string | null;
};

export type AlertRow = {
  category: string;
  dog_id: string;
  dog_name: string;
  breed_code: string;
  due_on: string | null;
  detail: string | null;
};

/** アラートの表示順。ホームの並びはここで決まる */
export const ALERT_CATEGORIES = [
  '混合ワクチン',
  '狂犬病ワクチン',
  '交配可能',
  '仔犬検診',
] as const;

export const BREED_FALLBACK_HEX = '#8A93A0';
export const COLOR_FALLBACK_HEX = '#DEDFD9';
