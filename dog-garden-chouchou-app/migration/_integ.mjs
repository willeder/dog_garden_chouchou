
function fmt(v){const p=n=>String(n).padStart(2,'0');return v.getFullYear()+'-'+p(v.getMonth()+1)+'-'+p(v.getDate());}
function addReview(out,s,r,k,d){out.review.push({種別:k,内容:d});}
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


function parseMatings(sheet, sheetName, rowNo, row, damName, out) {
  var seenDates = {};
  for (var i = 0; i < 6; i++) {
    var b = 16 + i * 6;
    var birth   = normDate(row[b]);
    var sireRaw = norm(row[b + 1]);
    var sire    = cleanSireName(row[b + 1]);
    var gest    = parseGestation(row[b + 2]);
    var male    = normNum(row[b + 3]);
    var female  = normNum(row[b + 4]);
    var st      = parseStillborn(row[b + 5]);

    var hasAny = birth || sire || gest.days !== null || gest.method ||
                 male !== null || female !== null || st.stillborn > 0 || st.note;
    if (!hasAny) continue;

    if (!birth) {
      addReview(out, sheetName, rowNo, '出産日が空',
        damName + ' ' + (i + 1) + '回目 : 他の項目は入力済みですが出産日がありません（このままでは登録できません）');
      continue;
    }
    if (seenDates[birth]) {
      addReview(out, sheetName, rowNo, '同一出産日の重複',
        damName + ' : ' + birth + ' が ' + seenDates[birth] + '回目 と ' + (i + 1) + '回目 に重複しています。' +
        '同日2回の出産でない限り、どちらかが入力ミスです');
      continue;
    }
    seenDates[birth] = i + 1;

    if (hasCircled(row[b + 1])) {
      addReview(out, sheetName, rowNo, '同名の個体を区別する符号',
        damName + ' ' + (i + 1) + '回目 : 雄犬欄が「' + norm(row[b + 1]) + '」。' +
        '同名の種雄犬が複数いる可能性があります。どの個体かを特定してください');
    }

    // 種雄犬の犬種を推定するための証拠を集める
    if (sire) {
      if (!out.sireEvidence[sire]) out.sireEvidence[sire] = { same: {}, diff: {}, rows: [], how: '' };
      var ev = out.sireEvidence[sire];
      var damBreed = out.damBreedByName[damName];
      if (damBreed) {
        if (isMixMark(sireRaw)) { ev.diff[damBreed] = true; ev.rows.push(damName + '(' + damBreed + ') ミックス'); }
        else                    { ev.same[damBreed] = true; ev.rows.push(damName + '(' + damBreed + ') 同犬種'); }
      }
    }

    if (gest.days !== null && (gest.days < 50 || gest.days > 75)) {
      addReview(out, sheetName, rowNo, '妊娠日数が範囲外',
        damName + ' ' + (i + 1) + '回目 : ' + gest.days + '日');
    }
    if (gest.leftover) {
      addReview(out, sheetName, rowNo, '妊娠日数欄に余分な文字',
        damName + ' ' + (i + 1) + '回目 : 「' + norm(row[b + 2]) + '」の残り「' + gest.leftover + '」');
    }

    out.litters.push({
      dam_name: damName, sire_name: sire, birth_date: birth,
      gestation_days: gest.days, method: gest.method,
      male_count: male === null ? 0 : male,
      female_count: female === null ? 0 : female,
      stillborn_count: st.stillborn, note: st.note
    });
  }
}


export {parseMatings};