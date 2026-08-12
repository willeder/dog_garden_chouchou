import { Puppy } from "@/app/_model/puppy";
import { DateStringResponse, ImageResponse, SexResponse } from "../basicResponse";
import { parseLocalDate } from "@/app/_lib/date";

/** microCMS「puppies」APIのレスポンス型 */
export type MCPuppy = {
  id: string;
  images: ImageResponse[];
  breed: string;
  sex: SexResponse[]; // セレクトフィールド（要素数1）
  birthday: DateStringResponse;
  color: string;
  price?: number;
  feature?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const newPuppyFromMC = (response: MCPuppy): Puppy => ({
  id: response.id,
  images: response.images ?? [],
  breed: response.breed,
  sex: response.sex[0],
  birthday: parseLocalDate(response.birthday),
  color: response.color,
  price: response.price,
  feature: response.feature,
});

export const newPuppiesFromResponseContents = (contents: MCPuppy[]): Puppy[] =>
  contents.map(newPuppyFromMC);
