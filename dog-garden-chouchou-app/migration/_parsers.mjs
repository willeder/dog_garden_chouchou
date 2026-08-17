
function fmt(v){const p=n=>String(n).padStart(2,'0');return v.getFullYear()+'-'+p(v.getMonth()+1)+'-'+p(v.getDate());}
var COLOR_MAP = {
  'AP': 'AP', 'アプリコット': 'AP',
  'RD': 'RD', 'レッド': 'RD', '赤': 'RD', '茶': 'RD',
  'CR': 'CR', 'クリーム': 'CR',
  'FN': 'FN', 'フォーン': 'FN',
  'W': 'W', 'WH': 'W', 'ホワイト': 'W', '白': 'W',
  'BK': 'BK', 'ブラック': 'BK', '黒': 'BK',
  'BKT': 'BKT', 'BK T': 'BKT', 'ブラタン': 'BKT', 'ブラックタン': 'BKT',
  'CHLT': 'CHLT', 'チョコ': 'CHLT', 'チョコレート': 'CHLT',
  'MERLE': 'MERLE', 'マール': 'MERLE',
  'BKW': 'BKW', 'BK WH': 'BKW', '黒白': 'BKW'
};
function norm(v) {
  if (v === null || v === undefined) return '';
  var s = String(v);
  if (typeof s.normalize === 'function') s = s.normalize('NFKC');
  return s.replace(/　/g, ' ').replace(/\s+/g, ' ').trim();
}

/** マイクロチップ: 数字だけを残す。15桁でなければ要確認へ回す */
function normChip(v) {
  var d = norm(v).replace(/\D/g, '');
  return d === '' ? null : d;
}

/** 日付: Date でも文字列でも受け、YYYY-MM-DD を返す */
function normDate(v) {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return fmt(v);
  }
  var s = norm(v);
  var m = s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (!m) return null;
  var y = m[1], mo = ('0' + m[2]).slice(-2), d = ('0' + m[3]).slice(-2);
  return y + '-' + mo + '-' + d;
}

function normNum(v) {
  var s = norm(v).replace(/[^0-9.\-]/g, '');
  if (s === '' || isNaN(Number(s))) return null;
  return Number(s);
}

/**
 * 「61日 帝」「58日 後帝」「帝」「59日」を日数と分娩方法に分解する。
 * 「59日♀5」のように頭数が紛れ込んでいるケースも日数だけ拾う。
 */
function parseGestation(v) {
  var s = norm(v);
  if (s === '') return { days: null, method: null, leftover: '' };
  var days = null;
  var m = s.match(/(\d{1,3})\s*日/);
  if (m) days = Number(m[1]);
  var method = null;
  if (/後帝/.test(s)) method = '後帝';
  else if (/帝/.test(s)) method = '帝王切開';
  else if (days !== null) method = '自然';
  var leftover = s.replace(/(\d{1,3})\s*日/, '').replace(/後帝|帝/, '').trim();
  return { days: days, method: method, leftover: leftover };
}

/** 備考の「死1」「死2」を死産数として抜き出し、備考からは除去する */
function parseStillborn(v) {
  var s = norm(v);
  var m = s.match(/死\s*(\d+)/);
  var n = m ? Number(m[1]) : 0;
  var rest = s.replace(/死\s*\d+/, '').trim();
  return { stillborn: n, note: rest };
}

/**
 * 丸数字（①②…）は同名の個体を区別するための符号。
 * NFKC正規化すると「1」になってしまうため、正規化の前に落とす。
 */
function stripCircled(v) {
  return String(v === null || v === undefined ? '' : v).replace(/[\u2460-\u2473]/g, '');
}

/** 「ルイ　Ⅿ」のようにミックス判定記号が付いているか */
function isMixMark(v) {
  return /[MⅯm]\s*$/.test(norm(stripCircled(v)));
}

/** 種雄犬名から、ミックス記号と丸数字を除去する */
function cleanSireName(v) {
  return norm(stripCircled(v)).replace(/\s*[MⅯm]\s*$/, '').trim();
}

/** 丸数字が付いているか（同名の個体がいる証拠） */
function hasCircled(v) {
  return /[\u2460-\u2473]/.test(String(v === null || v === undefined ? '' : v));
}

/**
 * カラー欄を毛色と毛質に分解する。
 * 「黒L」→ 毛色BK・毛質L、「BK T」→ 毛色BKT・毛質なし
 */
function parseColor(v) {
  var raw = norm(v);
  if (raw === '') return { color_code: null, coat_type: null, raw: '' };

  var coat = null;
  var body = raw;
  var m = raw.match(/^(.*?)\s*([LS])$/);
  if (m && m[1] !== '') { body = m[1].trim(); coat = m[2]; }

  var key = body.toUpperCase();
  var code = COLOR_MAP[key] || COLOR_MAP[body] || null;
  return { color_code: code, coat_type: coat, raw: raw };
}


export {norm,normChip,normDate,normNum,parseGestation,parseStillborn,cleanSireName,parseColor};