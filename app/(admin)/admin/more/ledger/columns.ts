/**
 * 帳簿の項目。
 *
 * 動物愛護管理法にもとづく台帳（第一種動物取扱業者の帳簿）に必要な項目で、
 * ビュー v_ledger の列名とそのまま一致させている。
 * 順番を変えるとCSVの列順が変わるので、役所に出した書式に合わせて動かさないこと。
 *
 * 【法令】帳簿は5年間の保存が必要。この画面から消すことはできない。
 */
export const LEDGER_COLUMNS = [
  '品種等の名称',
  '個体の名前',
  '生年月日',
  '性別',
  'マイクロチップ番号',
  '繁殖者の氏名',
  '繁殖者の登録番号',
  '所有した日',
  '入手先',
  '販売・引渡しの日',
  '販売・引渡し先',
  '引渡し先の法令違反確認',
  '販売担当者名',
  '対面説明等の実施',
  '対面説明の実施日',
  '死亡した日',
  '死亡の原因',
] as const;

export type LedgerColumn = (typeof LEDGER_COLUMNS)[number];

export type LedgerRow = { id: string } & Partial<Record<LedgerColumn, string | boolean | null>>;

/** 帳簿の行に、犬の状態（アプリ側の情報）を足したもの */
export type LedgerItem = {
  row: LedgerRow;
  status: string;
  isSelfBred: boolean;
  breedHex: string | null;
  missing: LedgerColumn[];
};

/**
 * いま埋まっていないといけないのに空いている項目を返す。
 *
 * 引渡しや死亡に関する項目は、その事実が起きるまでは空で正しい。
 * 状態に応じて「今required なものだけ」を見る。
 * ここを一律必須にすると画面が赤だらけになり、本当に足りないものが埋もれる。
 */
export function missingItems(row: LedgerRow, status: string, isSelfBred: boolean): LedgerColumn[] {
  const empty = (c: LedgerColumn) => {
    const v = row[c];
    return v === null || v === undefined || v === '';
  };
  const out: LedgerColumn[] = [];

  for (const c of ['生年月日', '性別', 'マイクロチップ番号', '所有した日'] as LedgerColumn[]) {
    if (empty(c)) out.push(c);
  }

  // 自家繁殖の犬は繁殖者＝自分なので、繁殖者・入手先は空で正しい
  if (!isSelfBred) {
    for (const c of ['繁殖者の氏名', '入手先'] as LedgerColumn[]) {
      if (empty(c)) out.push(c);
    }
  }

  if (status === '引渡済') {
    for (const c of [
      '販売・引渡しの日',
      '販売・引渡し先',
      '販売担当者名',
      '対面説明等の実施',
    ] as LedgerColumn[]) {
      if (empty(c)) out.push(c);
    }
  }

  if (status === '死亡' && empty('死亡した日')) out.push('死亡した日');

  return out;
}

export const LEDGER_FILTERS = [
  { key: 'all', label: 'すべて' },
  { key: 'missing', label: '不足あり' },
  { key: 'here', label: '在籍中' },
  { key: 'sold', label: '引渡済' },
  { key: 'died', label: '死亡' },
] as const;

export type LedgerFilterKey = (typeof LEDGER_FILTERS)[number]['key'];
