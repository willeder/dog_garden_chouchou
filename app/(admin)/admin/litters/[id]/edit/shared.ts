import type { DeliveryMethod } from '@/app/_model/admin';

/**
 * 出産記録の編集の入力の形と検証。
 *
 * クライアントとサーバの両方から読む。
 * 画面側だけで検証すると、通信が途中で切れたときに検証を通らない値が入る。
 * 同じ関数を両方で呼ぶことで、判定がずれないようにしている。
 *
 * 母犬はここに入れていない。母犬を差し替えると、その腹の仔犬の
 * 「母」だけが古いままになり、血統が食い違う。母を間違えた場合は
 * 記録ごと取り消して入れ直す。
 */

export type LitterEditInput = {
  birthDate: string;
  /** 空文字は「父は未登録」 */
  sireId: string;
  gestationDays: number | null;
  method: DeliveryMethod | null;
  male: number;
  female: number;
  stillborn: number;
  note: string;
};

export type LitterSaveResult =
  | { ok: true; movedPups: number }
  | { ok: false; message: string; conflictLitterId?: string };

export type LitterRemoveResult = { ok: true; damId: string } | { ok: false; message: string };

/**
 * 【DB】gestation_days は check (gestation_days between 50 and 75)。
 * 範囲外はDBが受け付けないので、画面側でも同じ範囲で止める。
 * 分からない場合は「不明」（null）にする。
 */
export const GEST_MIN = 50;
export const GEST_MAX = 75;

/** 1腹の頭数の上限。実務上ここを超えることはない（打ち間違いを止めるため） */
export const COUNT_MAX = 20;

export const DELIVERY_METHODS: DeliveryMethod[] = ['自然', '帝王切開', '後帝'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Bad = { message: string; field?: keyof LitterEditInput };

/**
 * 入力の検証。問題があればその理由を返す。
 * 「保存できません」だけでは直せないので、必ず何をどうするかを書く。
 */
export function validateLitter(input: LitterEditInput, todayIso: string): Bad | null {
  if (!DATE_RE.test(input.birthDate)) {
    return { message: '出産日を入れてください。', field: 'birthDate' };
  }
  if (input.birthDate > todayIso) {
    return { message: '出産日が未来の日付になっています。', field: 'birthDate' };
  }

  if (input.gestationDays !== null) {
    if (!Number.isInteger(input.gestationDays)) {
      return { message: '妊娠日数は整数で入れてください。', field: 'gestationDays' };
    }
    if (input.gestationDays < GEST_MIN || input.gestationDays > GEST_MAX) {
      return {
        message: `妊娠日数は${GEST_MIN}〜${GEST_MAX}日で入れてください。分からない場合は「不明」にします。`,
        field: 'gestationDays',
      };
    }
  }

  for (const [label, v, field] of [
    ['♂の数', input.male, 'male'],
    ['♀の数', input.female, 'female'],
    ['死産の数', input.stillborn, 'stillborn'],
  ] as const) {
    if (!Number.isInteger(v) || v < 0 || v > COUNT_MAX) {
      return { message: `${label}は0〜${COUNT_MAX}で入れてください。`, field };
    }
  }

  if (input.note.length > 2000) {
    return { message: '備考は2000文字までです。', field: 'note' };
  }

  return null;
}
