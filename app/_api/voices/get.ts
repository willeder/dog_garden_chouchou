import { GetRequest } from "microcms-js-sdk";
import { client, isMicroCMSConfigured } from "@/app/_lib/microcms/client";
import { Voice } from "@/app/_model/voice";
import { MCVoice, newVoicesFromResponseContents } from "./response";
import { defaultItemLimit, defaultRevalidateTime } from "@/app/_config/isr";
import { mockVoices } from "@/app/_data/mockVoices";

const revalidate = defaultRevalidateTime;

/** お客様の声一覧を取得する（microCMS未設定時はモック） */
export const getVoices = async (
  params?: Omit<GetRequest, "endpoint">
): Promise<Voice[]> => {
  if (!isMicroCMSConfigured) return mockVoices;

  try {
    const { contents } = await client.getList<MCVoice>({
      endpoint: "voices",
      queries: { limit: defaultItemLimit },
      customRequestInit: { next: { tags: ["get-voices"], revalidate } },
      ...params,
    });
    return newVoicesFromResponseContents(contents);
  } catch (error) {
    console.error("microCMSからのお客様の声取得に失敗しました:", error);
    return mockVoices;
  }
};
