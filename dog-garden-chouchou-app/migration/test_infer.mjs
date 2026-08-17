// gas_export.gs の推定ロジックを、実データの交配記録で検証する
import fs from 'fs';
const src = fs.readFileSync('gas_export.gs','utf8');
const grab=(a,b)=>src.slice(src.indexOf(a), b?src.indexOf(b):undefined);
const cm = grab('var COLOR_MAP', '// ============================================================\n// 文字列ユーティリティ');
const utils = grab('function norm(', '// ============================================================\n// シート判定').replace(/Utilities\.formatDate\([^)]*\)/g,'fmt(v)');
const infer = grab('function inferSireBreeds(', '/** 種雄犬台帳の行をいったん保留する');
const head = `
function fmt(v){return '';}
var SIRE_BREED_OVERRIDE = {};
function addReview(out,s,r,k,d){out.review.push({種別:k,内容:d});}
`;
fs.writeFileSync('_infer.mjs', head+cm+'\n'+utils+'\n'+infer+'\nexport {inferSireBreeds,isMixMark,cleanSireName};');
const M = await import('./_infer.mjs');

const matings = [
 ['ビター','TP','エルメス'],['クッキー','TP','ディオ　Ⅿ'],['クッキー','TP','エルメス'],
 ['モコ','TP','エルメス'],['ピノ','TP','ディオ　Ⅿ'],['ピノ','TP','エルメス'],['ピノ','TP','ハリー'],
 ['マロン','TP','エルメス'],['マロン','TP','アル'],['ポコ','TP','ルイ'],['ポコ','TP','ドルチェ　Ⅿ'],
 ['ロイズ','TP','ヴィトン'],
 ['ネーブル','ML','ルイ　Ⅿ'],['レモン','ML','プラダ①'],['レモン','ML','ヴィトン　Ⅿ'],['レモン','ML','歌舞伎'],
 ['ベリー','ML','ルイ　Ⅿ'],['パイン','ML','クリフ　Ⅿ'],['メロン','ML','ピケ　Ⅿ'],['メロン','ML','歌舞伎'],
 ['プリン','ML','ヴィトン　Ⅿ'],['バニラ','ML','クリフ　Ⅿ'],['ムース','ML','クリフ　Ⅿ'],
 ['ジョジョ','CI','クリフ'],['ジュジュ','CI','ポロ'],['モモ','CI','ヴィトン　Ⅿ'],['モモ','CI','ルイ　Ⅿ'],
 ['クロミ','CI','ピケ'],['チコ','CI','クロム'],['チコ','CI','グラフ'],['テテ','CI','ピケ'],
 ['トト','CI','グラフ'],['ノン','CI','ポロ'],['リリ','CI','ディオ　Ⅿ'],['リリ','CI','クリフ'],
 ['ララ','CI','ヴィトン　Ⅿ'],
];
const out={review:[],sireEvidence:{},sireBreed:{},damBreedByName:{}};
for(const [dam,b] of matings) out.damBreedByName[dam]=b;
for(const [dam,damBreed,raw] of matings){
  const sire=M.cleanSireName(raw); if(!sire) continue;
  out.sireEvidence[sire] ??= {same:{},diff:{},rows:[],how:''};
  const e=out.sireEvidence[sire];
  if(M.isMixMark(raw)){e.diff[damBreed]=true;e.rows.push(`${dam}(${damBreed}) ミックス`);}
  else {e.same[damBreed]=true;e.rows.push(`${dam}(${damBreed}) 同犬種`);}
}
M.inferSireBreeds(out);
console.table(Object.keys(out.sireEvidence).sort().map(n=>({
  種雄犬:n, 判定:out.sireBreed[n]||'（判定不能）', 根拠:out.sireEvidence[n].how
})));
console.log('\n要確認に出たもの:');
out.review.forEach(r=>console.log(' -',r.内容));
