/**
 * 表示整形。
 *
 * 日付は必ず「日付として」扱い、Date に通さない。
 * Supabase から来る `2026-07-23` を new Date() に渡すとUTC解釈になり、
 * JST では前日にずれる。台帳アプリで1日ずれるのは致命的なので文字列で扱う。
 */

export function ymd(v: string | null | undefined): string {
  if (!v) return '—';
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}/${m[2]}/${m[3]}` : v;
}

/**
 * 「2023年5月7日」。
 * 入力欄の日付ピッカーは端末の言語で表記が変わり、05/07 が5月7日か7月5日か
 * 分からなくなる。入れた日付をこの形でも出して、読み違えを防ぐ。
 */
export function ymdJp(v: string | null | undefined): string {
  if (!v) return '';
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : v;
}

export function ym(v: string | null | undefined): string {
  if (!v) return '—';
  const m = v.match(/^(\d{4})-(\d{2})/);
  return m ? `${m[1]}年${Number(m[2])}月` : v;
}

/** マイクロチップ 15桁を 3-3-3-3-3 に区切る。桁ずれ照合を防ぐ */
export function chip(v: string | null | undefined): string {
  if (!v) return '—';
  return v.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

/** 誕生日から「2歳3ヶ月」を出す。月末をまたぐ計算はしない（表示用） */
export function ageLabel(birthday: string | null, today: string): string {
  if (!birthday) return '—';
  const b = birthday.slice(0, 10).split('-').map(Number);
  const t = today.slice(0, 10).split('-').map(Number);
  if (b.length !== 3 || t.length !== 3) return '—';
  let months = (t[0] - b[0]) * 12 + (t[1] - b[1]);
  if (t[2] < b[2]) months -= 1;
  if (months < 0) return '—';
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y > 0 ? `${y}歳${m}ヶ月` : `${m}ヶ月`;
}

/** その月の1日（YYYY-MM-01）。月送りに使う */
export function monthStart(year: number, month1to12: number): string {
  return `${year}-${String(month1to12).padStart(2, '0')}-01`;
}

export function shiftMonth(iso: string, delta: number): string {
  const [y, m] = iso.split('-').map(Number);
  const total = y * 12 + (m - 1) + delta;
  return monthStart(Math.floor(total / 12), (total % 12) + 1);
}

/** JST の今日を YYYY-MM-DD で返す。サーバのTZに依存させない */
export function todayJst(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** 期日が対象月の初日より前なら期限超過 */
export function isOverdue(dueOn: string | null, monthIso: string): boolean {
  if (!dueOn) return false;
  return dueOn < monthIso;
}
