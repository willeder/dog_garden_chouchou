import { Puppy } from "@/app/_model/puppy";
import { Sex } from "@/app/_model/sex";

const image = (url: string) => ({ url, width: 1008, height: 836 });

/**
 * microCMS未接続時に表示するダミーデータ。
 * 環境変数（MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY）を設定すると
 * 自動的にmicroCMSの内容に切り替わる。
 */
const seeds: { breed: string; sex: Sex; color: string; feature: string; price: number }[] = [
  { breed: "マルチーズ", sex: "男の子", color: "ホワイト", feature: "大きい目", price: 230000 },
  { breed: "マルチーズ", sex: "女の子", color: "ホワイト", feature: "甘えん坊", price: 250000 },
  { breed: "チワワ", sex: "男の子", color: "クリーム", feature: "元気いっぱい", price: 280000 },
  { breed: "チワワ", sex: "女の子", color: "フォーン", feature: "おっとり", price: 270000 },
  { breed: "トイプードル", sex: "男の子", color: "アプリコット", feature: "人なつっこい", price: 300000 },
  { breed: "トイプードル", sex: "女の子", color: "レッド", feature: "遊び好き", price: 320000 },
  { breed: "ビションフリーぜ", sex: "男の子", color: "ホワイト", feature: "ふわふわの毛", price: 350000 },
  { breed: "ミックス", sex: "女の子", color: "ホワイト×ブラウン", feature: "好奇心旺盛", price: 200000 },
  { breed: "ミックス", sex: "男の子", color: "クリーム", feature: "落ち着いた性格", price: 210000 },
  { breed: "マルチーズ", sex: "男の子", color: "ホワイト", feature: "よく食べる", price: 240000 },
  { breed: "チワワ", sex: "女の子", color: "ブラックタン", feature: "甘えん坊", price: 290000 },
  { breed: "トイプードル", sex: "男の子", color: "クリーム", feature: "毛量たっぷり", price: 310000 },
  { breed: "ビションフリーぜ", sex: "女の子", color: "ホワイト", feature: "おだやか", price: 360000 },
  { breed: "ミックス", sex: "女の子", color: "アプリコット", feature: "人が大好き", price: 220000 },
  { breed: "マルチーズ", sex: "女の子", color: "ホワイト", feature: "小柄", price: 260000 },
];

export const mockPuppies: Puppy[] = seeds.map((puppy, index) => ({
  id: `sample-${index + 1}`,
  images: [image("/assets/puppies-photo-sample.jpg")],
  birthday: new Date(2023, 11, 8),
  ...puppy,
}));
