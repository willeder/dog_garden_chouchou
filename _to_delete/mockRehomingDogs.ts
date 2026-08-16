import { RehomingDog } from "@/app/_model/rehoming";
import { Sex } from "@/app/_model/sex";

const image = (url: string) => ({ url, width: 1008, height: 836 });

const description =
  "出産・子育てをがんばってくれた女の子です。人が大好きで、抱っこをするとすぐに甘えてくれます。これからの犬生を、家族の一員としてのんびり過ごさせてあげたいと思っています。";

const seeds: {
  name: string;
  breed: string;
  sex: Sex;
  size: string;
  color: string;
  weight: number;
  vaccination: boolean;
  neutering: boolean;
  photo: string;
}[] = [
  { name: "ももちゃん", breed: "マルチーズ", sex: "女の子", size: "小型犬", color: "ホワイト", weight: 3.2, vaccination: true, neutering: true, photo: "/assets/top-voice-photo-1.jpg" },
  { name: "そらくん", breed: "チワワ", sex: "男の子", size: "小型犬", color: "クリーム", weight: 2.8, vaccination: true, neutering: false, photo: "/assets/top-voice-photo-2.jpg" },
  { name: "はなちゃん", breed: "トイプードル", sex: "女の子", size: "小型犬", color: "アプリコット", weight: 3.5, vaccination: true, neutering: true, photo: "/assets/top-voice-photo-3.jpg" },
  { name: "こむぎちゃん", breed: "ビションフリーぜ", sex: "女の子", size: "小型犬", color: "ホワイト", weight: 4.8, vaccination: true, neutering: true, photo: "/assets/top-puppy-photo-4.jpg" },
];

/** microCMS未接続時に表示するダミーデータ */
export const mockRehomingDogs: RehomingDog[] = seeds.map((seed, index) => ({
  id: `rehoming-${index + 1}`,
  name: seed.name,
  images: [image(seed.photo)],
  breed: seed.breed,
  sex: seed.sex,
  birthday: new Date(2021, 4 + index, 15),
  size: seed.size,
  color: seed.color,
  weight: seed.weight,
  vaccination: seed.vaccination,
  neutering: seed.neutering,
  description,
}));
