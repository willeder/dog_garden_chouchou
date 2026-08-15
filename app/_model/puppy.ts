import { ImageWithSize } from "./image";
import { Sex } from "./sex";

/** 親犬（dog_breeder_ran の Parent と同じ項目構成） */
export type Parent = {
  id: string;
  image: ImageWithSize;
  name: string;
  breed: string;
  sex: Sex;
  birthday: Date;
  color: string;
  /** 体重（kg） */
  weight: number;
};

export type Status = "商談中" | "成約済み";

/** 仔犬（dog_breeder_ran の Puppy と同じ項目構成） */
export type Puppy = {
  id: string;
  /** 1枚目がメイン画像、2枚目以降がサムネイル */
  images: ImageWithSize[];
  breed: string;
  /** 犬種の補足説明 */
  breedExplanation?: string;
  sex: Sex;
  birthday: Date;
  color: string;
  /** 成犬時予想体重（kg以下） */
  expectedWeight?: number;
  /** 成犬時予想体高（cm以下） */
  expectedHeight?: number;
  /** 価格（円・税込） */
  price?: number;
  /** ブリーダーからのメッセージ */
  message: string;
  mother?: Parent;
  father?: Parent;
  /** 未設定＝募集中 */
  status?: Status;
};
