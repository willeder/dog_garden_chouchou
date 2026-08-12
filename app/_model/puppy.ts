import { ImageWithSize } from "./image";
import { Sex } from "./sex";

export type Puppy = {
  id: string;
  /** 1枚目がメイン画像、2枚目以降がサムネイル */
  images: ImageWithSize[];
  breed: string;
  sex: Sex;
  birthday: Date;
  /** 毛色 */
  color: string;
  /** 価格（円） */
  price?: number;
  /** 特徴（例: 大きい目） */
  feature?: string;
};
