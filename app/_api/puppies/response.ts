import { Parent, Puppy, Status } from "@/app/_model/puppy";
import { DateStringResponse, ImageResponse, SexResponse } from "../basicResponse";
import { parseLocalDate } from "@/app/_lib/date";

export type StatusResponse = Status;

/** microCMS「parents」APIのレスポンス型（puppies から参照される） */
export type MCParent = {
  id: string;
  image: ImageResponse[]; // 要素数は1つ
  name: string;
  breed: string;
  sex: SexResponse[]; // 要素数は1つ
  birthday: DateStringResponse;
  color: string;
  weight: number;
};

const newParentFromMC = (response: MCParent): Parent => ({
  id: response.id,
  image: response.image[0],
  name: response.name,
  breed: response.breed,
  sex: response.sex[0],
  birthday: parseLocalDate(response.birthday),
  color: response.color,
  weight: response.weight,
});

/**
 * microCMS「puppies」APIのレスポンス型。
 * ran は画像を images1 / images2 に分けているが、chouchou では images 1フィールドに統一。
 */
export type MCPuppy = {
  id: string;
  images: ImageResponse[];
  breed: string;
  breed_explanation?: string;
  sex: SexResponse[]; // 要素数は1つ
  birthday: DateStringResponse;
  color: string;
  expected_weight?: number;
  expected_height?: number;
  price?: number;
  message: string;
  mother?: MCParent;
  father?: MCParent;
  status: StatusResponse[]; // 要素数は0または1つ
  createdAt?: string;
  updatedAt?: string;
};

export const newPuppyFromMC = (response: MCPuppy): Puppy => ({
  id: response.id,
  images: response.images ?? [],
  breed: response.breed,
  breedExplanation: response.breed_explanation,
  sex: response.sex[0],
  birthday: parseLocalDate(response.birthday),
  color: response.color,
  expectedWeight: response.expected_weight,
  expectedHeight: response.expected_height,
  price: response.price,
  message: response.message,
  mother: response.mother ? newParentFromMC(response.mother) : undefined,
  father: response.father ? newParentFromMC(response.father) : undefined,
  status: response.status?.length > 0 ? response.status[0] : undefined,
});

export const newPuppiesFromResponseContents = (contents: MCPuppy[]): Puppy[] =>
  contents.map(newPuppyFromMC);
