import { RehomingDog } from "@/app/_model/rehoming";
import { DateStringResponse, ImageResponse, SexResponse } from "../basicResponse";
import { parseLocalDate } from "@/app/_lib/date";

/** microCMS「rehoming」APIのレスポンス型 */
export type MCRehomingDog = {
  id: string;
  name: string;
  images: ImageResponse[];
  breed: string;
  sex: SexResponse[]; // セレクトフィールド（要素数1）
  birthday: DateStringResponse;
  size: string;
  color: string;
  weight: number;
  vaccination: boolean;
  neutering: boolean;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

export const newRehomingDogFromMC = (response: MCRehomingDog): RehomingDog => ({
  id: response.id,
  name: response.name,
  images: response.images ?? [],
  breed: response.breed,
  sex: response.sex[0],
  birthday: parseLocalDate(response.birthday),
  size: response.size,
  color: response.color,
  weight: response.weight,
  vaccination: response.vaccination,
  neutering: response.neutering,
  description: response.description,
});

export const newRehomingDogsFromResponseContents = (
  contents: MCRehomingDog[]
): RehomingDog[] => contents.map(newRehomingDogFromMC);
