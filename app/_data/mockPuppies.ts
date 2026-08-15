import { Parent, Puppy, Status } from "@/app/_model/puppy";
import { Sex } from "@/app/_model/sex";

const image = (url: string) => ({ url, width: 1008, height: 836 });

const message =
  "とても人なつっこく、抱っこが大好きな子です。兄妹犬と元気いっぱいに遊びながら、毎日すくすく育っています。ごはんもよく食べ、健康状態も良好です。新しいご家族のもとでも、たくさん甘えながら過ごしてくれると思います。";

const mother: Parent = {
  id: "parent-mother",
  image: image("/assets/top-voice-photo-1.jpg"),
  name: "ももちゃん",
  breed: "マルチーズ",
  sex: "女の子",
  birthday: new Date(2020, 3, 10),
  color: "ホワイト",
  weight: 3.2,
};

const father: Parent = {
  id: "parent-father",
  image: image("/assets/top-voice-photo-2.jpg"),
  name: "そらくん",
  breed: "マルチーズ",
  sex: "男の子",
  birthday: new Date(2019, 8, 22),
  color: "ホワイト",
  weight: 3.6,
};

const seeds: {
  breed: string;
  breedExplanation?: string;
  sex: Sex;
  color: string;
  price: number;
  expectedWeight?: number;
  expectedHeight?: number;
  status?: Status;
  photo: string;
}[] = [
  { breed: "マルチーズ", breedExplanation: "純白の被毛と穏やかな性格が魅力の小型犬です。", sex: "男の子", color: "ホワイト", price: 230000, expectedWeight: 3, expectedHeight: 25, photo: "/assets/top-puppy-photo-1.jpg" },
  { breed: "マルチーズ", sex: "女の子", color: "ホワイト", price: 250000, expectedWeight: 3, status: "商談中", photo: "/assets/top-voice-photo-1.jpg" },
  { breed: "チワワ", breedExplanation: "小柄で愛嬌たっぷり。飼い主さんに一途な犬種です。", sex: "男の子", color: "クリーム", price: 280000, expectedWeight: 2.5, expectedHeight: 20, photo: "/assets/top-puppy-photo-3.jpg" },
  { breed: "チワワ", sex: "女の子", color: "フォーン", price: 270000, expectedWeight: 2.5, status: "成約済み", photo: "/assets/top-voice-photo-2.jpg" },
  { breed: "トイプードル", breedExplanation: "抜け毛が少なく、賢くしつけやすい犬種です。", sex: "男の子", color: "アプリコット", price: 300000, expectedWeight: 3.5, expectedHeight: 28, photo: "/assets/top-puppy-photo-5.jpg" },
  { breed: "トイプードル", sex: "女の子", color: "レッド", price: 320000, expectedWeight: 3.5, photo: "/assets/top-voice-photo-3.jpg" },
  { breed: "ビションフリーぜ", breedExplanation: "ふわふわの被毛と人なつっこさが人気の犬種です。", sex: "男の子", color: "ホワイト", price: 350000, expectedWeight: 5, expectedHeight: 30, photo: "/assets/top-puppy-photo-4.jpg" },
  { breed: "ミックス", sex: "女の子", color: "ホワイト×ブラウン", price: 200000, photo: "/assets/puppies-photo-sample.jpg" },
  { breed: "ミックス", sex: "男の子", color: "クリーム", price: 210000, status: "商談中", photo: "/assets/top-puppy-photo-2.jpg" },
  { breed: "マルチーズ", sex: "男の子", color: "ホワイト", price: 240000, photo: "/assets/top-puppy-photo-1.jpg" },
  { breed: "チワワ", sex: "女の子", color: "ブラックタン", price: 290000, photo: "/assets/top-puppy-photo-3.jpg" },
  { breed: "トイプードル", sex: "男の子", color: "クリーム", price: 310000, photo: "/assets/top-puppy-photo-5.jpg" },
  { breed: "ビションフリーぜ", sex: "女の子", color: "ホワイト", price: 360000, status: "成約済み", photo: "/assets/top-puppy-photo-4.jpg" },
  { breed: "ミックス", sex: "女の子", color: "アプリコット", price: 220000, photo: "/assets/puppies-photo-sample.jpg" },
  { breed: "マルチーズ", sex: "女の子", color: "ホワイト", price: 260000, photo: "/assets/top-voice-photo-1.jpg" },
];

/**
 * microCMS未接続時に表示するダミーデータ。
 * 環境変数（MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY）を設定すると
 * 自動的にmicroCMSの内容に切り替わる。
 */
export const mockPuppies: Puppy[] = seeds.map((seed, index) => ({
  id: `sample-${index + 1}`,
  images: [image(seed.photo), image("/assets/top-puppy-photo-2.jpg"), image("/assets/puppies-photo-sample.jpg")],
  breed: seed.breed,
  breedExplanation: seed.breedExplanation,
  sex: seed.sex,
  birthday: new Date(2026, 1 + (index % 6), 8),
  color: seed.color,
  expectedWeight: seed.expectedWeight,
  expectedHeight: seed.expectedHeight,
  price: seed.price,
  message,
  mother,
  father,
  status: seed.status,
}));
