/**
 * 管理画面の「戻る」先。
 *
 * 以前は各画面の「‹」の戻り先が固定で、来た画面に戻れなかった
 * （帳簿 → 編集 → 保存 → カルテ → 犬一覧、のように元の画面から外れていく）。
 * 画面を開くときに ?from=<元の画面> を付け、戻る・保存後はそこへ帰す。
 */

/** 管理画面内のパスだけを受け付ける。外部URLへ飛ばされないようにする */
export function safeFrom(v: string | string[] | undefined | null): string | null {
  if (typeof v !== 'string') return null;
  if (!v.startsWith('/admin') || v.startsWith('//') || v.includes('\\')) return null;
  return v;
}

/** href に ?from= を付ける。from が無ければそのまま */
export function withFrom(href: string, from: string | null | undefined): string {
  if (!from) return href;
  return `${href}${href.includes('?') ? '&' : '?'}from=${encodeURIComponent(from)}`;
}
