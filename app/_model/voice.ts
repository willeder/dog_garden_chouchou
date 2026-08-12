import { ImageWithSize } from "./image";

export type Voice = {
  id: string;
  image?: ImageWithSize;
  /** 例: 福岡市 T様宅　マルチーズ　〇〇ちゃん */
  title: string;
  body: string;
};
