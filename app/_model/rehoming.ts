import { ImageWithSize } from "./image";
import { Sex } from "./sex";

/** 里親募集中のわんちゃん（dog_breeder_ran の RehomingDog と同じ項目構成） */
export type RehomingDog = {
  id: string;
  name: string;
  images: ImageWithSize[];
  breed: string;
  sex: Sex;
  birthday: Date;
  /** 体のサイズ（例: 小型犬 / 体高25cm） */
  size: string;
  color: string;
  /** 体重（kg） */
  weight: number;
  vaccination: boolean;
  neutering: boolean;
  /** ブリーダーからの紹介文 */
  description: string;
};
