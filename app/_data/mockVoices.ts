import { Voice } from "@/app/_model/voice";

const body =
  "テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。";

/** microCMS未接続時に表示するダミーデータ */
export const mockVoices: Voice[] = [
  { title: "福岡市 T様宅　マルチーズ　〇〇ちゃん", photo: "/assets/top-voice-photo-1.jpg" },
  { title: "福岡市 A様宅　チワワ　〇〇ちゃん", photo: "/assets/top-voice-photo-2.jpg" },
  { title: "福岡市 N様宅　トイプードル　〇〇ちゃん", photo: "/assets/top-voice-photo-3.jpg" },
  { title: "福岡市 T様宅　マルチーズ　〇〇ちゃん", photo: "/assets/voice-avatar-photo.jpg" },
].map((voice, index) => ({
  id: `voice-${index + 1}`,
  title: voice.title,
  body,
  image: { url: voice.photo, width: 697, height: 1108 },
}));
