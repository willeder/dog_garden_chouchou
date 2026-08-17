// 台帳の交配記録から種雄犬の犬種を推定する（Ⅿ＝ミックス記号を手がかりにする）
const matings = [
  // [母犬, 母の犬種, 雄犬欄の原文]
  ['ビター','TP','エルメス'],['ビター','TP','エルメス'],
  ['クッキー','TP','ディオ　Ⅿ'],['クッキー','TP','エルメス'],['クッキー','TP','エルメス'],['クッキー','TP','エルメス'],
  ['モコ','TP','エルメス'],
  ['ピノ','TP','ディオ　Ⅿ'],['ピノ','TP','エルメス'],['ピノ','TP','ハリー'],
  ['マロン','TP','エルメス'],['マロン','TP','アル'],
  ['ポコ','TP','ルイ'],['ポコ','TP','ドルチェ　Ⅿ'],
  ['ロイズ','TP','ヴィトン'],
  ['ネーブル','ML','ルイ　Ⅿ'],['ネーブル','ML','ルイ　Ⅿ'],['ネーブル','ML','ルイ　Ⅿ'],['ネーブル','ML','ルイ　Ⅿ'],
  ['レモン','ML','プラダ①'],['レモン','ML','ヴィトン　Ⅿ'],['レモン','ML','歌舞伎'],['レモン','ML','ルイ　Ⅿ'],['レモン','ML','ヴィトン　Ⅿ'],
  ['ベリー','ML','ルイ　Ⅿ'],['ベリー','ML','ルイ　Ⅿ'],['ベリー','ML','ルイ　Ⅿ'],
  ['パイン','ML','クリフ　Ⅿ'],['パイン','ML','ルイ　Ⅿ'],
  ['メロン','ML','ピケ　Ⅿ'],['メロン','ML','歌舞伎'],['メロン','ML','クリフ　Ⅿ'],
  ['プリン','ML','ヴィトン　Ⅿ'],['プリン','ML','ヴィトン　Ⅿ'],
  ['バニラ','ML','クリフ　Ⅿ'],['バニラ','ML','ヴィトン　Ⅿ'],
  ['ムース','ML','クリフ　Ⅿ'],
  ['ジョジョ','CI','クリフ'],['ジョジョ','CI','クリフ'],['ジョジョ','CI','クリフ'],['ジョジョ','CI','クリフ'],
  ['ジュジュ','CI','クリフ'],['ジュジュ','CI','クリフ'],['ジュジュ','CI','ポロ'],['ジュジュ','CI','クリフ'],
  ['モモ','CI','ヴィトン　Ⅿ'],['モモ','CI','ルイ　Ⅿ'],['モモ','CI','ルイ　Ⅿ'],
  ['クロミ','CI','ピケ'],['クロミ','CI','クリフ'],['クロミ','CI','クリフ'],
  ['チコ','CI','クロム'],['チコ','CI','ピケ'],['チコ','CI','グラフ'],
  ['テテ','CI','ピケ'],['テテ','CI','ピケ'],['テテ','CI','ピケ'],
  ['トト','CI','ヴィトン　Ⅿ'],['トト','CI','ルイ　Ⅿ'],['トト','CI','グラフ'],
  ['ノン','CI','ピケ'],['ノン','CI','ポロ'],
  ['ラン','CI','ポロ'],['ラン','CI','ピケ'],
  ['リン','CI','クリフ'],['リン','CI','ポロ'],
  ['リリ','CI','ディオ　Ⅿ'],['リリ','CI','クリフ'],['リリ','CI','ディオ　Ⅿ'],
  ['ルル','CI','ピケ'],
  ['クク','CI','クリフ'],['クク','CI','グラフ'],
  ['ララ','CI','ヴィトン　Ⅿ'],
];
const clean = s => s.normalize('NFKC').replace(/　/g,' ').replace(/①|②/g,'').replace(/\s*[MⅯm]\s*$/,'').trim();
const hasM  = s => /[MⅯm]\s*$/.test(s.normalize('NFKC').replace(/　/g,' ').replace(/①|②/g,'').trim());
const BREEDS=['TP','ML','CI','BFR'];

const ev = {};
for (const [dam, damBreed, raw] of matings) {
  const name = clean(raw); if(!name) continue;
  ev[name] ??= {same:new Set(), diff:new Set(), rows:[]};
  if (hasM(raw)) { ev[name].diff.add(damBreed); ev[name].rows.push(`${dam}(${damBreed}) ミックス`); }
  else           { ev[name].same.add(damBreed); ev[name].rows.push(`${dam}(${damBreed}) 同犬種`); }
}

const out=[];
for (const [name,e] of Object.entries(ev)) {
  const same=[...e.same], diff=[...e.diff];
  let breed=null, conf='', note='';
  if (same.length===1 && !diff.includes(same[0])) { breed=same[0]; conf='確定'; }
  else if (same.length>1) { breed=null; conf='矛盾'; note=`同犬種の記録が複数の犬種にある: ${same.join(',')}`; }
  else if (same.length===0) {
    const cand = BREEDS.filter(b=>!diff.includes(b) && b!=='BFR');
    if (cand.length===1){breed=cand[0];conf='推定';note=`${diff.join(',')}とのミックス記録のみ。消去法`;}
    else {breed=null;conf='判定不能';note=`${diff.join(',')}以外としか分からない`;}
  }
  if (same.length===1 && diff.includes(same[0])) { breed=null; conf='矛盾'; note=`${same[0]}母と「同犬種」「ミックス」両方の記録がある`; }
  out.push({種雄犬:name, 判定:breed??'—', 確度:conf, 根拠:e.rows.join(' / '), 備考:note});
}
out.sort((a,b)=>(a.確度+a.種雄犬).localeCompare(b.確度+b.種雄犬,'ja'));
console.table(out.map(o=>({種雄犬:o.種雄犬,判定:o.判定,確度:o.確度,備考:o.備考||'—'})));
console.log('\n--- 根拠の詳細 ---');
out.forEach(o=>console.log(`${o.種雄犬.padEnd(8,'　')} ${o.判定}  ${o.根拠}`));
