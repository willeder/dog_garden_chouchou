import fs from 'fs';
const src = fs.readFileSync('gas_export.gs','utf8');
const cm = src.slice(src.indexOf('var COLOR_MAP'), src.indexOf('};', src.indexOf('var COLOR_MAP'))+2);
const utils = src.slice(src.indexOf('function norm('), src.indexOf('// ============================================================\n// シート判定'))
  .replace(/Utilities\.formatDate\([^)]*\)/g,'fmt(v)');
const pmStart = src.indexOf('function parseMatings(');
const pmEnd   = src.indexOf('// ============================================================\n// 出力');
const pm = src.slice(pmStart, pmEnd);
const head = `
function fmt(v){const p=n=>String(n).padStart(2,'0');return v.getFullYear()+'-'+p(v.getMonth()+1)+'-'+p(v.getDate());}
function addReview(out,s,r,k,d){out.review.push({種別:k,内容:d});}
`;
fs.writeFileSync('_integ.mjs', head+cm+'\n'+utils+'\n'+pm+'\nexport {parseMatings};');
const { parseMatings } = await import('./_integ.mjs');

// 実データそのまま（母犬台帳の16列目以降＝交配履歴）
const mk = (name, cells) => { const r = new Array(16).fill(''); return [name, r.concat(cells)]; };

const cases = [
  // クッキー（TP #4）出産4回
  mk('クッキー', [
    '2024/8/15','ディオ　Ⅿ','61日','1','1','',
    '2025/4/10','エルメス','60日','','4','',
    '2025/11/8','エルメス','60日','1','','死1',
    '2026/6/7','エルメス','62日','1','2','死1',
    '','','','','','',
    '','','','','','']),
  // ジョジョ（CI #4）2回目に出産日なし、4回目=5回目が重複
  mk('ジョジョ', [
    '','','','','','',
    '','クリフ','62日　帝','2','3','',
    '2025/4/18','クリフ','57日　帝','','2','死2',
    '2026/5/21','クリフ','５８日　帝','3','1','',
    '2026/5/21','クリフ','58日　帝','3','1','',
    '','','','','','']),
  // クロミ（CI #7）4回目=5回目が重複
  mk('クロミ', [
    '2024/3/19','','62日','2','2','',
    '2024/11/3','','62日　帝','2','2','',
    '2025/4/22','ピケ　','60日　帝','1','3','',
    '2026/4/30','クリフ','60日　帝','2','2','',
    '2026/4/30','クリフ','60日　帝','2','2','',
    '','','','','','']),
  // モモ（CI #6）3回目に「59日♀5」
  mk('モモ', [
    '2024/4/2','','62日','1','','死3',
    '2024/12/31','ヴィトン　Ⅿ','63日','4','1','',
    '2025/6/8','ルイ　Ⅿ','59日♀5','','','',
    '2025/12/12','ルイ　Ⅿ','57日','1','3','',
    '','','','','','',
    '','','','','','']),
];

const out = { litters: [], review: [], sireEvidence:{}, damBreedByName:{クッキー:'TP',ジョジョ:'CI',クロミ:'CI',モモ:'CI'} };
for (const [name, row] of cases) parseMatings(null, 'sheet', 1, row, name, out);

console.log('=== 出産記録（変換結果） ===');
console.table(out.litters.map(l=>({母:l.dam_name,出産日:l.birth_date,父:l.sire_name,日数:l.gestation_days,分娩:l.method,'♂':l.male_count,'♀':l.female_count,死産:l.stillborn_count,備考:l.note})));
console.log('=== 要確認リスト ===');
out.review.forEach(r=>console.log(' -',r.種別,':',r.内容));

// 期待値チェック
let ng=0;
const expect=(c,m)=>{ if(!c){console.log('NG:',m); ng++;} };
expect(out.litters.filter(l=>l.dam_name==='クッキー').length===4,'クッキーは4件');
expect(out.litters.find(l=>l.birth_date==='2025-11-08').stillborn_count===1,'死1が死産数へ');
expect(out.litters.find(l=>l.birth_date==='2024-08-15').sire_name==='ディオ','Ⅿ記号が除去される');
expect(out.litters.find(l=>l.birth_date==='2026-05-21').gestation_days===58,'全角５８日が58に');
expect(out.review.some(r=>r.種別==='出産日が空'),'ジョジョ2回目を検出');
expect(out.review.filter(r=>r.種別==='同一出産日の重複').length===2,'重複2件を検出');
expect(out.litters.filter(l=>l.birth_date==='2026-05-21').length===1,'重複は1件だけ登録');
expect(out.review.some(r=>r.種別==='妊娠日数欄に余分な文字'),'59日♀5 を検出');
console.log('\n'+(ng===0?'ALL PASS':ng+'件 失敗'));
