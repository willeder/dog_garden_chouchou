/**
 * Dog Garden Chouchou 台帳 → Supabase 移行用エクスポータ
 *
 * 使い方:
 *   1. スプレッドシートを開く → 拡張機能 → Apps Script
 *   2. このファイルの内容を貼り付けて保存
 *   3. 関数 `run` を実行（初回は権限の承認を求められます）
 *   4. スプレッドシートと同じフォルダに CSV が書き出されます
 *
 * 出力:
 *   dogs.csv           犬（母犬＋種雄犬。仔犬は含まない）
 *   litters.csv        出産記録
 *   vaccinations.csv   ワクチン接種日
 *   partners.csv       仕入れ元・繁殖者
 *   review.csv         ★要確認リスト（必ず目視すること）
 *   summary.csv        件数照合レポート
 *
 * 方針:
 *   - シート名に依存しない。ヘッダー行のパターンで台帳の種類を判定する
 *   - 判断に迷う行は捨てずに review.csv へ出す。黙って落とさない
 */

// ============================================================
// 設定
// ============================================================

/**
 * 種雄犬の犬種は、原則として**交配記録から自動で推定**します。
 * 台帳の「雄犬」欄に付く「Ⅿ」＝ミックス（父と母の犬種が違う）という記号を手がかりに、
 *   - Ⅿが付かない交配が1件でもある → その母犬と同じ犬種
 *   - Ⅿ付きの交配しかない          → その犬種ではない（消去法で絞る）
 * と判定します。判定できなかった犬だけ、下の SIRE_BREED_OVERRIDE に書いてください。
 *
 * ★交配記録が1件も無い種雄犬（新入り・退役済みなど）は推定できません。
 *   実行後に出力される sire_breeds.csv を見て、ここに追記して再実行してください。
 */
var SIRE_BREED_OVERRIDE = {
  // 例: 'ドルチェ': 'ML',
};

/** 毛色の正規化。左が台帳の表記、右が coat_colors.code */
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

// ============================================================
// 文字列ユーティリティ
// ============================================================

/**
 * NFKC正規化。台帳には「５８日」「ＢＫ」のような全角が混在しており、
 * これを通さないと以降の正規表現がすべて外れる。
 */
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
    return Utilities.formatDate(v, 'Asia/Tokyo', 'yyyy-MM-dd');
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

// ============================================================
// シート判定
// ============================================================

var DAM_HEADER  = ['犬種', '誕生日', '名前', 'カラー'];
var SIRE_HEADER = ['誕生日', '名前', '体重', 'カラー'];

function rowHas(row, words) {
  var joined = row.map(norm).join('|');
  return words.every(function (w) { return joined.indexOf(w) >= 0; });
}

/** ヘッダー行かどうか。台帳は途中でヘッダーが再登場する */
function isDamHeader(row) {
  return rowHas(row, DAM_HEADER) && norm(row[1]) === '犬種';
}
function isSireHeader(row) {
  return rowHas(row, SIRE_HEADER) && norm(row[0]) === '犬種';
}
function isMatingHeader(row) {
  return norm(row[16]) === '1回目' || norm(row[16]) === '１回目';
}

// ============================================================
// 本体
// ============================================================

function run() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = {
    dogs: [], litters: [], vaccinations: [], partners: {}, review: [], sireEvidence: {},
    pendingSires: [], sireBreed: {}, damBreedByName: {}
  };
  var seenDogNames = {};

  // ── 1パス目: 母犬・交配・種雄犬の行を読み取る ──
  ss.getSheets().forEach(function (sheet) {
    var name = sheet.getName();
    var values = sheet.getDataRange().getValues();
    var mode = null;

    for (var r = 0; r < values.length; r++) {
      var row = values[r];
      if (isDamHeader(row))  { mode = 'dam';  continue; }
      if (isSireHeader(row)) { mode = 'sire'; continue; }
      if (isMatingHeader(row) && !isDamHeader(row)) { continue; }

      if (mode === 'dam')  parseDamRow(sheet, name, r + 1, row, out, seenDogNames);
      if (mode === 'sire') collectSireRow(name, r + 1, row, out);
    }
  });

  // ── 2パス目: 交配記録から種雄犬の犬種を推定してから登録する ──
  inferSireBreeds(out);
  out.pendingSires.forEach(function (p) { emitSire(p, out, seenDogNames); });

  writeAll(ss, out);

  var unknown = Object.keys(out.sireEvidence).filter(function (k) {
    return !out.sireBreed[k];
  }).length;
  SpreadsheetApp.getUi().alert(
    'エクスポート完了\n\n' +
    '犬 ' + out.dogs.length + '頭 / 出産 ' + out.litters.length + '件 / ' +
    'ワクチン ' + out.vaccinations.length + '件\n' +
    '★要確認 ' + out.review.length + '件（review.csv を必ず確認してください）\n' +
    '犬種を判定できなかった種雄犬 ' + unknown + '頭（sire_breeds.csv を確認）'
  );
}

/**
 * 交配記録から種雄犬の犬種を推定する。
 * 「Ⅿ」が付かない交配 → 母と同じ犬種 / 「Ⅿ」付きのみ → その犬種ではない
 */
function inferSireBreeds(out) {
  var BREEDS = ['TP', 'ML', 'CI'];   // BFR は母犬が0頭のため消去法の候補から外す

  Object.keys(out.sireEvidence).forEach(function (name) {
    var e = out.sireEvidence[name];
    var same = Object.keys(e.same), diff = Object.keys(e.diff);
    var decided = null, how = '';

    if (SIRE_BREED_OVERRIDE[name]) {
      decided = SIRE_BREED_OVERRIDE[name];
      how = '手動指定';
    } else if (same.length === 1 && diff.indexOf(same[0]) < 0) {
      decided = same[0];
      how = '確定（' + same[0] + 'の母犬と同犬種の交配記録あり）';
    } else if (same.length === 1 && diff.indexOf(same[0]) >= 0) {
      how = '矛盾（' + same[0] + 'の母犬に「同犬種」と「ミックス」の両方の記録がある）';
    } else if (same.length > 1) {
      how = '矛盾（' + same.join('・') + ' の複数犬種で「同犬種」の記録がある）';
    } else {
      var cand = BREEDS.filter(function (b) { return diff.indexOf(b) < 0; });
      if (cand.length === 1) {
        decided = cand[0];
        how = '推定（' + diff.join('・') + ' とのミックス記録のみ。消去法）';
      } else {
        how = '判定不能（' + diff.join('・') + ' 以外としか分からない）';
      }
    }

    e.how = how;
    if (decided) out.sireBreed[name] = decided;
    else addReview(out, '種雄犬', '', '種雄犬の犬種を判定できない',
      name + ' : ' + how + ' → SIRE_BREED_OVERRIDE に追記して再実行してください');
  });
}

/** 種雄犬台帳の行をいったん保留する（犬種の推定を待つ） */
function collectSireRow(sheetName, rowNo, row, out) {
  var name = norm(row[2]);
  if (!name) return;
  out.pendingSires.push({ sheetName: sheetName, rowNo: rowNo, row: row, name: name });
  if (!out.sireEvidence[name]) out.sireEvidence[name] = { same: {}, diff: {}, rows: [], how: '' };
}

function addReview(out, sheet, row, kind, detail) {
  out.review.push([sheet, row, kind, detail]);
}

function registerName(seen, name, sheet, row, out) {
  if (!name) return;
  if (seen[name]) {
    addReview(out, sheet, row, '同名の犬',
      '「' + name + '」が ' + seen[name] + ' にも存在します。血統の紐付けが誤る可能性があります');
  } else {
    seen[name] = sheet + ' 行' + row;
  }
}

function addPartner(out, name, contact) {
  var n = norm(name);
  if (!n || n === '自家繁殖') return null;
  if (!out.partners[n]) out.partners[n] = { name: n, contact: norm(contact) || '' };
  else if (!out.partners[n].contact && norm(contact)) out.partners[n].contact = norm(contact);
  return n;
}

/** 母犬台帳の1行 */
function parseDamRow(sheet, sheetName, rowNo, row, out, seen) {
  var breed = norm(row[1]).toUpperCase();
  var name  = norm(row[3]);
  if (!name) return;
  if (['TP', 'ML', 'CI', 'BFR'].indexOf(breed) < 0) {
    addReview(out, sheetName, rowNo, '犬種が不明', '犬種欄=「' + norm(row[1]) + '」 名前=' + name);
    return;
  }

  var col   = parseColor(row[4]);
  var chip  = normChip(row[8]);
  if (norm(row[8]) && (!chip || chip.length !== 15)) {
    addReview(out, sheetName, rowNo, 'マイクロチップの桁数',
      name + ' : 「' + norm(row[8]) + '」→ ' + (chip ? chip.length + '桁' : '数字なし'));
  }
  if (col.raw && !col.color_code) {
    addReview(out, sheetName, rowNo, '毛色を正規化できない', name + ' : 「' + col.raw + '」');
  }

  var selfBred = norm(row[12]).indexOf('自家繁殖') >= 0;
  var supplier = addPartner(out, row[13], row[14]);
  var breeder  = selfBred ? null : (addPartner(out, row[12], '') || supplier);
  var birthday = normDate(row[2]);

  if (!birthday) addReview(out, sheetName, rowNo, '誕生日が空', name);
  if (!selfBred && !supplier) {
    addReview(out, sheetName, rowNo, '所有日を確定できない',
      name + ' : 仕入れ元が不明のため acquired_on が空になります。法令の帳簿項目です');
  }

  registerName(seen, name, sheetName, rowNo, out);
  out.damBreedByName[name] = breed;   // 種雄犬の犬種推定に使う

  out.dogs.push({
    breed_code: breed, sex: '♀', name: name, birthday: birthday,
    color: col.raw, color_code: col.color_code, coat_type_code: col.coat_type,
    weight_kg: normNum(row[6]), microchip: chip,
    genes: norm(row[11]), breeder_note: norm(row[5]),
    is_self_bred: selfBred, breeder_name: breeder || '', supplier_name: supplier || '',
    acquired_on: selfBred ? birthday : '', status: '在籍'
  });

  pushVaccination(out, name, '混合',   row[7]);
  pushVaccination(out, name, '狂犬病', row[9]);
  parseMatings(sheet, sheetName, rowNo, row, name, out);
}

/** 犬種が確定した種雄犬を dogs へ登録する */
function emitSire(p, out, seen) {
  var row = p.row, name = p.name;
  var breed = out.sireBreed[name];
  if (!breed) return;   // 判定不能なものは review.csv 側で報告済み

  var col  = parseColor(row[4]);
  var chip = normChip(row[7]);
  if (norm(row[7]) && (!chip || chip.length !== 15)) {
    addReview(out, p.sheetName, p.rowNo, 'マイクロチップの桁数',
      name + ' : 「' + norm(row[7]) + '」');
  }

  var birthday = normDate(row[1]);
  var selfBred = norm(row[11]).indexOf('自家繁殖') >= 0;
  var supplier = addPartner(out, row[12], row[13]);

  var missing = [];
  if (!birthday) missing.push('誕生日');
  if (!normNum(row[3])) missing.push('体重');
  if (!chip) missing.push('マイクロチップ');
  if (!col.raw) missing.push('カラー');
  if (missing.length >= 3) {
    addReview(out, p.sheetName, p.rowNo, '必須項目がほぼ空',
      name + ' : ' + missing.join('・') + ' が未入力です');
  }

  registerName(seen, name, p.sheetName, p.rowNo, out);

  out.dogs.push({
    breed_code: breed, sex: '♂', name: name, birthday: birthday,
    color: col.raw, color_code: col.color_code, coat_type_code: col.coat_type,
    weight_kg: normNum(row[3]), microchip: chip,
    genes: norm(row[9]), breeder_note: norm(row[5]),
    is_self_bred: selfBred, breeder_name: '', supplier_name: supplier || '',
    acquired_on: selfBred ? birthday : '', status: '在籍'
  });

  pushVaccination(out, name, '混合',   row[6]);
  pushVaccination(out, name, '狂犬病', row[8]);
}

function pushVaccination(out, dogName, kind, v) {
  var d = normDate(v);
  if (d) out.vaccinations.push({ dog_name: dogName, kind: kind, dosed_on: d });
}

/** 交配履歴 6回ぶんの横展開を1回1行に開く */
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

// ============================================================
// 出力
// ============================================================

function toCsv(rows) {
  return rows.map(function (r) {
    return r.map(function (c) {
      var s = (c === null || c === undefined) ? '' : String(c);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(',');
  }).join('\n');
}

function saveCsv(folder, fileName, rows) {
  // Excel で開いても文字化けしないよう UTF-8 BOM を付ける
  var blob = Utilities.newBlob('﻿' + toCsv(rows), 'text/csv', fileName);
  var existing = folder.getFilesByName(fileName);
  while (existing.hasNext()) existing.next().setTrashed(true);
  folder.createFile(blob);
}

function writeAll(ss, out) {
  var folder = DriveApp.getFileById(ss.getId()).getParents().next();

  saveCsv(folder, 'dogs.csv', [[
    'breed_code','sex','name','birthday','color','color_code','coat_type_code',
    'weight_kg','microchip','genes','breeder_note','is_self_bred',
    'breeder_name','supplier_name','acquired_on','status'
  ]].concat(out.dogs.map(function (d) {
    return [d.breed_code, d.sex, d.name, d.birthday, d.color, d.color_code, d.coat_type_code,
            d.weight_kg, d.microchip, d.genes, d.breeder_note, d.is_self_bred,
            d.breeder_name, d.supplier_name, d.acquired_on, d.status];
  })));

  saveCsv(folder, 'litters.csv', [[
    'dam_name','sire_name','birth_date','gestation_days','method',
    'male_count','female_count','stillborn_count','note'
  ]].concat(out.litters.map(function (l) {
    return [l.dam_name, l.sire_name, l.birth_date, l.gestation_days, l.method,
            l.male_count, l.female_count, l.stillborn_count, l.note];
  })));

  saveCsv(folder, 'vaccinations.csv', [['dog_name','kind','dosed_on']]
    .concat(out.vaccinations.map(function (v) { return [v.dog_name, v.kind, v.dosed_on]; })));

  var partners = Object.keys(out.partners).map(function (k) {
    return [out.partners[k].name, out.partners[k].contact, ''];
  });
  saveCsv(folder, 'partners.csv', [['name','contact_name','license_no']].concat(partners));

  saveCsv(folder, 'review.csv', [['シート','行','種別','内容']].concat(out.review));

  // 種雄犬の犬種の判定結果と根拠
  var sires = Object.keys(out.sireEvidence).sort().map(function (n) {
    var e = out.sireEvidence[n];
    return [n, out.sireBreed[n] || '（判定不能）', e.how, e.rows.join(' / ')];
  });
  saveCsv(folder, 'sire_breeds.csv',
    [['種雄犬','犬種','判定根拠','交配記録']].concat(sires));

  // 件数照合レポート
  var byBreed = {};
  out.dogs.forEach(function (d) {
    var k = d.breed_code + ' ' + d.sex;
    byBreed[k] = (byBreed[k] || 0) + 1;
  });
  var totalPups = out.litters.reduce(function (a, l) { return a + l.male_count + l.female_count; }, 0);
  var totalStill = out.litters.reduce(function (a, l) { return a + l.stillborn_count; }, 0);

  var summary = [['項目','件数']];
  Object.keys(byBreed).sort().forEach(function (k) { summary.push([k, byBreed[k]]); });
  summary.push(['犬 合計', out.dogs.length]);
  summary.push(['出産記録', out.litters.length]);
  summary.push(['産子数 合計（♂＋♀）', totalPups]);
  summary.push(['死産 合計', totalStill]);
  summary.push(['ワクチン記録', out.vaccinations.length]);
  summary.push(['相手先', partners.length]);
  summary.push(['★要確認', out.review.length]);

  // 毛色・毛質の出現数（グルーピング判断用）
  var colorCount = {}, coatCount = {};
  out.dogs.forEach(function (d) {
    if (d.color) colorCount[d.color] = (colorCount[d.color] || 0) + 1;
    if (d.coat_type_code) coatCount[d.coat_type_code] = (coatCount[d.coat_type_code] || 0) + 1;
  });
  summary.push(['', '']);
  summary.push(['カラー欄の原文', '出現数']);
  Object.keys(colorCount).sort().forEach(function (k) { summary.push([k, colorCount[k]]); });
  summary.push(['', '']);
  summary.push(['毛質', '出現数']);
  Object.keys(coatCount).sort().forEach(function (k) { summary.push([k, coatCount[k]]); });

  saveCsv(folder, 'summary.csv', summary);
}
