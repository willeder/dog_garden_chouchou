/**
 * CSV の組み立てとダウンロード。
 *
 * 役所へ出す書類の元になるので、Excel で文字化けしないことを最優先にしている。
 *   ・先頭に BOM を付ける（付けないと Excel が Shift_JIS と誤解して化ける）
 *   ・改行は CRLF（Excel の期待する形）
 *   ・数字に見える文字列（マイクロチップ 15桁）が指数表記にならないよう必ず引用符で囲む
 */
export function toCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const esc = (v: string | number | boolean | null | undefined): string => {
    if (v === null || v === undefined) return '""';
    if (typeof v === 'boolean') return v ? '"はい"' : '"いいえ"';
    return `"${String(v).replace(/"/g, '""')}"`;
  };
  const lines = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))];
  return '﻿' + lines.join('\r\n') + '\r\n';
}

/**
 * ブラウザで保存させる。サーバーには送らない。
 *
 * ファイル名は必ず半角英数字にすること。
 * 日本語のファイル名は一部のブラウザで捨てられ、拡張子まで失われた
 * 「download」という名前で保存される。そうなるとExcelで開けなくなる。
 */
export function downloadCsv(fileName: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  // すぐに revoke すると、ブラウザが中身を読む前にURLが無効になり、
  // ファイル名が「download」になったり保存自体が失敗することがある。
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 2000);
}
