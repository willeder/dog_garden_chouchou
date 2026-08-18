import type { DogStatus } from '@/app/_model/admin';

/**
 * 編集画面の入力の形と検証。
 *
 * クライアントとサーバの両方から読む。
 * 画面側だけで検証すると、通信が途中で切れたときに検証を通らない値が入る。
 * 同じ関数を両方で呼ぶことで、判定がずれないようにしている。
 */

export type DogEditInput = {
  name: string;
  sex: '♂' | '♀';
  birthday: string;
  color_code: string;
  coat_type_code: string;
  ribbon_code: string;
  weight_kg: string;
  microchip: string;
  genes: string;
  status: DogStatus;
  died_on: string;
  death_cause: string;
  is_self_bred: boolean;
  breeder_id: string;
  supplier_id: string;
  acquired_on: string;
  note: string;
};

export type SaveDogResult = { ok: true } | { ok: false; message: string; field?: keyof DogEditInput };

export const DOG_STATUSES: DogStatus[] = [
  '在舎',
  '商談中',
  '売約',
  '引渡済',
  '在籍',
  '退役',
  '預託',
  '死亡',
];

/** 台帳に出す状態の説明。現場で「預託って何だった？」となるため画面に出す */
export const STATUS_HELP: Record<DogStatus, string> = {
  在舎: '販売する仔犬が犬舎にいる',
  商談中: '見学・仮予約が入っている',
  売約: '契約済みで引渡し前',
  引渡済: '飼い主に引き渡した',
  在籍: '繁殖に使う親犬として犬舎にいる',
  退役: '繁殖から引退した',
  預託: '他の場所に預けている',
  死亡: '死亡した',
};

/** マイクロチップは数字だけにする。読取器の出力に空白やハイフンが混ざる */
export function normalizeChip(v: string): string {
  return v.replace(/\D/g, '');
}

/** 「PRA・DM」「PRA, DM」どちらの書き方でも受ける */
export function parseGenes(v: string): string[] | null {
  const list = v
    .split(/[・,、\s/]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : null;
}

export function formatGenes(genes: string[] | null | undefined): string {
  return (genes ?? []).join('・');
}

/** 全角で入力されても受ける。スマホのキーボード設定で全角になることがある */
function toHalfWidth(v: string): string {
  return v
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[．。]/g, '.')
    .replace(/[，、]/g, ',');
}

/** 体重などの小数。空欄は null、数字でなければ NaN */
export function parseDecimal(v: string): number | null {
  const s = toHalfWidth(v).trim().replace(/,/g, '');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export function parseInteger(v: string): number | null {
  const n = parseDecimal(v);
  if (n === null) return null;
  if (Number.isNaN(n)) return NaN;
  return Math.round(n);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 入力の検証。問題があればその理由を返す。
 * 「保存できません」だけでは直せないので、必ず何をどうするかを書く。
 */
export function validateDog(input: DogEditInput): { message: string; field?: keyof DogEditInput } | null {
  if (!input.name.trim()) return { message: '名前を入れてください。', field: 'name' };
  if (input.name.trim().length > 40) return { message: '名前は40文字までです。', field: 'name' };

  if (input.birthday && !DATE_RE.test(input.birthday)) {
    return { message: '誕生日の形式が正しくありません。', field: 'birthday' };
  }
  if (input.acquired_on && !DATE_RE.test(input.acquired_on)) {
    return { message: '所有した日の形式が正しくありません。', field: 'acquired_on' };
  }
  if (input.died_on && !DATE_RE.test(input.died_on)) {
    return { message: '死亡した日の形式が正しくありません。', field: 'died_on' };
  }

  if (input.birthday && input.acquired_on && input.acquired_on < input.birthday) {
    return { message: '所有した日が誕生日より前になっています。', field: 'acquired_on' };
  }
  if (input.birthday && input.died_on && input.died_on < input.birthday) {
    return { message: '死亡した日が誕生日より前になっています。', field: 'died_on' };
  }

  // 【法令】死亡日は帳簿の項目。状態を死亡にしたら必ず入れる
  if (input.status === '死亡' && !input.died_on) {
    return { message: '状態が「死亡」のときは死亡した日を入れてください（帳簿の項目です）。', field: 'died_on' };
  }
  if (input.status !== '死亡' && input.died_on) {
    return { message: '死亡した日が入っています。状態を「死亡」にするか、日付を消してください。', field: 'status' };
  }

  const chipDigits = normalizeChip(input.microchip);
  if (chipDigits && chipDigits.length !== 15) {
    return {
      message: `マイクロチップは15桁です（今は${chipDigits.length}桁）。読み取った数字をそのまま入れてください。`,
      field: 'microchip',
    };
  }

  const w = parseDecimal(input.weight_kg);
  if (Number.isNaN(w)) return { message: '体重は数字で入れてください。', field: 'weight_kg' };
  if (w !== null && (w <= 0 || w > 60)) {
    return { message: '体重は0より大きく60kg以下で入れてください。', field: 'weight_kg' };
  }

  // 仕入れた犬の所有日が空でも保存は止めない。
  // 現行台帳に取得日の記録が無く、購入時の書類を探さないと埋まらないため。
  // 未入力であることは個体カードの「帳簿の項目」で赤く出る。

  return null;
}

/** 自家繁殖のときの所有日は誕生日。法令上そう扱う */
export function selfBredAcquiredOn(input: DogEditInput): string {
  return input.is_self_bred && input.birthday ? input.birthday : input.acquired_on;
}
