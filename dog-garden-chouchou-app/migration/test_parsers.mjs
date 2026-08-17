// gas_export.gs のパーサ部分を抜き出して実データで検証する
import fs from 'fs';
const src = fs.readFileSync('gas_export.gs','utf8');
const cmStart = src.indexOf('var COLOR_MAP');
const cmEnd   = src.indexOf('};', cmStart)+2;
const colorMap = src.slice(cmStart, cmEnd);
const start = src.indexOf('function norm(');
const end   = src.indexOf('// ============================================================\n// シート判定');
const code = src.slice(start,end)
  .replace(/Utilities\.formatDate\([^)]*\)/g, 'fmt(v)');
const helpers = `
function fmt(v){const p=n=>String(n).padStart(2,'0');return v.getFullYear()+'-'+p(v.getMonth()+1)+'-'+p(v.getDate());}
`;
const mod = helpers + colorMap + '\n' + code + '\nexport {norm,normChip,normDate,normNum,parseGestation,parseStillborn,cleanSireName,parseColor};';
fs.writeFileSync('_parsers.mjs', mod);
const P = await import('./_parsers.mjs');

let pass=0, fail=0;
const t=(label,actual,expected)=>{
  const a=JSON.stringify(actual), e=JSON.stringify(expected);
  if(a===e){pass++;} else {fail++; console.log('NG',label,'\n   actual  ',a,'\n   expected',e);}
};

console.log('=== 妊娠日数・分娩方法（全角混在の実データ） ===');
t('61日 帝',      P.parseGestation('61日　帝'),      {days:61,method:'帝王切開',leftover:''});
t('５８日 帝(全角)', P.parseGestation('５８日　帝'),  {days:58,method:'帝王切開',leftover:''});
t('61日 後帝',    P.parseGestation('61日　後帝'),    {days:61,method:'後帝',leftover:''});
t('60日',         P.parseGestation('60日'),          {days:60,method:'自然',leftover:''});
t('帝のみ',       P.parseGestation('帝'),            {days:null,method:'帝王切開',leftover:''});
t('58日 帝(半角)', P.parseGestation('58日 帝'),      {days:58,method:'帝王切開',leftover:''});
t('59日♀5',       P.parseGestation('59日♀5'),        {days:59,method:'自然',leftover:'♀5'});
t('空',           P.parseGestation(''),              {days:null,method:null,leftover:''});

console.log('=== 死産の抽出 ===');
t('死1',      P.parseStillborn('死1'),        {stillborn:1,note:''});
t('死2',      P.parseStillborn('死2'),        {stillborn:2,note:''});
t('死1 剥離', P.parseStillborn('死1　剥離'),  {stillborn:1,note:'剥離'});
t('ネーブルへ', P.parseStillborn('ネーブルへ'), {stillborn:0,note:'ネーブルへ'});

console.log('=== マイクロチップ（実データ4パターン） ===');
t('区切りあり',   P.normChip('392 149 002 433 081'),  '392149002433081');
t('先頭に空白',   P.normChip(' 392 146 001 717 375'), '392146001717375');
t('区切り位置違い',P.normChip('392146 001 786 148'),   '392146001786148');
t('区切りなし',   P.normChip('392149002175241'),      '392149002175241');
t('空',           P.normChip(''),                     null);

console.log('=== 種雄犬名のミックス記号除去 ===');
t('ルイ Ⅿ',   P.cleanSireName('ルイ　Ⅿ'),      'ルイ');
t('ヴィトン Ⅿ',P.cleanSireName('ヴィトン　Ⅿ'), 'ヴィトン');
t('ディオ Ⅿ', P.cleanSireName('ディオ　Ⅿ'),    'ディオ');
t('クリフ',   P.cleanSireName('クリフ'),        'クリフ');

console.log('=== 毛色と毛質の分離 ===');
t('AP',      P.parseColor('AP'),      {color_code:'AP',coat_type:null,raw:'AP'});
t('ＢＫ全角', P.parseColor('ＢＫ'),    {color_code:'BK',coat_type:null,raw:'BK'});
t('BK T',    P.parseColor('BK　T'),   {color_code:'BKT',coat_type:null,raw:'BK T'});
t('黒L',     P.parseColor('黒L'),     {color_code:'BK',coat_type:'L',raw:'黒L'});
t('茶S',     P.parseColor('茶S'),     {color_code:'RD',coat_type:'S',raw:'茶S'});
t('ブラタン', P.parseColor('ブラタン'), {color_code:'BKT',coat_type:null,raw:'ブラタン'});
t('マール',   P.parseColor('マール'),   {color_code:'MERLE',coat_type:null,raw:'マール'});
t('CHLT',    P.parseColor('CHLT'),    {color_code:'CHLT',coat_type:null,raw:'CHLT'});
t('牛(不明)', P.parseColor('牛'),      {color_code:null,coat_type:null,raw:'牛'});

console.log('=== 日付 ===');
t('2021/11/19', P.normDate('2021/11/19'), '2021-11-19');
t('2026/3/13',  P.normDate('2026/3/13'),  '2026-03-13');
t('空',         P.normDate(''),           null);

console.log('\n'+(fail===0?`ALL PASS (${pass}件)`:`${fail}件 失敗 / ${pass}件 成功`));
