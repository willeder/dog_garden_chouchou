/**
 * 公開設定の型と条件。
 *
 * actions.ts は 'use server' なので、関数以外を export できない。
 * 画面とサーバ処理の両方から読む値はここに置く。
 */

export type PublishInput = {
  is_published: boolean;
  list_price: string;
  expected_weight_kg: string;
  expected_height_cm: string;
  public_message: string;
};

export type PublishResult = { ok: true; published: boolean } | { ok: false; message: string };

/**
 * サイトに出せる状態。
 * ビュー v_public_puppies の WHERE と必ず一致させること。
 * ここだけ変えるとスイッチは入るのにサイトに出ない、という状態になる。
 */
export const PUBLISHABLE_STATUSES = ['在舎', '商談中', '売約'] as const;
