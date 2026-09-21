/**
 * 引渡しの記録の型と入力チェック。
 * actions.ts は 'use server' なので、関数以外はここに置く。
 *
 * 【法令】動物愛護管理法の帳簿の記載項目:
 *   販売・引渡しの日／販売・引渡し先／販売担当者名／対面説明等の実施（と実施日）／
 *   引渡し先の法令違反の有無の確認
 */
export type HandoverInput = {
  handover_date: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  price: string;
  staff_name: string;
  explained_in_person: boolean;
  explained_on: string;
  compliance_checked: boolean;
  note: string;
};

export type HandoverResult = { ok: true } | { ok: false; message: string };

export function validateHandover(i: HandoverInput): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(i.handover_date)) return '引渡しの日を入れてください。';
  if (!i.customer_name.trim()) return '引渡し先（お客様のお名前）を入れてください。';
  if (!i.staff_name.trim()) return '販売担当者名を入れてください。';
  if (i.explained_in_person && !/^\d{4}-\d{2}-\d{2}$/.test(i.explained_on)) {
    return '対面説明をした日を入れてください。';
  }
  if (i.explained_in_person && i.explained_on > i.handover_date) {
    return '対面説明は引渡しの日より前（または同じ日）に行う必要があります。日付を確認してください。';
  }
  const p = i.price.replace(/[,，円\s]/g, '');
  if (p && !/^\d+$/.test(p)) return '価格は数字で入れてください。';
  return null;
}

export function parsePrice(v: string): number | null {
  const p = v.replace(/[,，円\s]/g, '');
  return p ? Number(p) : null;
}
