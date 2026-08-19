export type VaccineTarget = {
  id: string;
  name: string;
  sex: string;
  breed_code: string;
  breed_name: string;
  breed_hex: string | null;
  birthday: string | null;
  status: string;
  litter_id: string | null;
  /** 腹の見出し（母犬名＋出産日）。親犬は null */
  litter_label: string | null;
  litter_date: string | null;
  /** 選んだ種類の前回接種日・次回予定日。種類ごとに持つ */
  due: Record<string, { last: string | null; next: string | null }>;
};

export type VaccineInput = {
  kind: string;
  dosedOn: string;
  dogIds: string[];
  note: string;
};

export type VaccineResult =
  | { ok: true; inserted: number; skipped: number }
  | { ok: false; message: string };

/** 一度に記録できる頭数の上限。押し間違いで全頭に入るのを防ぐ */
export const MAX_AT_ONCE = 100;

export const TARGET_FILTERS = [
  { key: 'due', label: '期限が来ている' },
  { key: 'puppy', label: '仔犬' },
  { key: 'all', label: 'すべて' },
] as const;

export type TargetFilterKey = (typeof TARGET_FILTERS)[number]['key'];

/** 期限が来ているか。記録が1件も無い犬も「来ている」に含める */
export function isDue(due: { last: string | null; next: string | null } | undefined, today: string): boolean {
  if (!due || !due.last) return true;
  if (!due.next) return true;
  return due.next <= today;
}
