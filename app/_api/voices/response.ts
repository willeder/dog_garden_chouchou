import { Voice } from "@/app/_model/voice";
import { ImageResponse } from "../basicResponse";

/** microCMS「voices」APIのレスポンス型 */
export type MCVoice = {
  id: string;
  image?: ImageResponse;
  title: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
};

export const newVoiceFromMC = (response: MCVoice): Voice => ({
  id: response.id,
  image: response.image,
  title: response.title,
  body: response.body,
});

export const newVoicesFromResponseContents = (contents: MCVoice[]): Voice[] =>
  contents.map(newVoiceFromMC);
