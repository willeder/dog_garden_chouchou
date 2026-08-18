export type ReportRow = {
  breed_code: string;
  breed_name: string;
  /** ① 前年度末の数 */
  opening_count: number;
  /** ② 当年度に所有した数 */
  acquired_count: number;
  /** ③ 当年度に販売・引渡しした数 */
  sold_count: number;
  /** ④ 当年度に死亡した数 */
  died_count: number;
  /** ⑤ 当年度末の数 */
  closing_count: number;
};

export const REPORT_HEADERS = [
  '犬種',
  '前年度末の数',
  '当年度に所有した数',
  '当年度に販売・引渡した数',
  '当年度に死亡した数',
  '当年度末の数',
] as const;

/** 年度は4月はじまり。2026-08-18 は 2026年度 */
export function fiscalYearOf(iso: string): number {
  const [y, m] = iso.split('-').map(Number);
  return m >= 4 ? y : y - 1;
}

export function fiscalRange(fy: number): { start: string; end: string } {
  return { start: `${fy}-04-01`, end: `${fy + 1}-03-31` };
}

/**
 * いま届け出るべき年度。
 *
 * 定期報告は毎年4月1日〜5月30日に「前年度分」を出す。
 * その期間に画面を開いたら、報告する年度が最初から選ばれているようにする。
 * それ以外の時期は、いま進んでいる年度を見せる。
 */
export function defaultFiscalYear(today: string): number {
  const fy = fiscalYearOf(today);
  const [, m, d] = today.split('-').map(Number);
  const inWindow = m === 4 || (m === 5 && d <= 30);
  return inWindow ? fy - 1 : fy;
}

/** 提出期間の中かどうか */
export function inFilingWindow(today: string): boolean {
  const [, m, d] = today.split('-').map(Number);
  return m === 4 || (m === 5 && d <= 30);
}
