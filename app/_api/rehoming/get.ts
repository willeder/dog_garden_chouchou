import { GetRequest } from "microcms-js-sdk";
import { client, isMicroCMSConfigured } from "@/app/_lib/microcms/client";
import { RehomingDog } from "@/app/_model/rehoming";
import { MCRehomingDog, newRehomingDogFromMC, newRehomingDogsFromResponseContents } from "./response";
import { defaultItemLimit, defaultRevalidateTime } from "@/app/_config/isr";
import { mockRehomingDogs } from "@/app/_data/mockRehomingDogs";

const revalidate = defaultRevalidateTime;

/** 里親募集中のわんちゃん一覧（microCMS未設定時はモック） */
export const getRehomingDogs = async (
  params?: Omit<GetRequest, "endpoint">
): Promise<RehomingDog[]> => {
  if (!isMicroCMSConfigured) return mockRehomingDogs;

  try {
    const { contents } = await client.getList<MCRehomingDog>({
      endpoint: "rehoming",
      queries: { limit: defaultItemLimit },
      customRequestInit: { next: { tags: ["get-rehoming-dogs"], revalidate } },
      ...params,
    });
    return newRehomingDogsFromResponseContents(contents);
  } catch (error) {
    console.error("microCMSからの里親募集犬一覧の取得に失敗しました:", error);
    return mockRehomingDogs;
  }
};

/** 里親募集中のわんちゃん1件 */
export const getRehomingDog = async (
  contentId: string
): Promise<RehomingDog | undefined> => {
  if (!isMicroCMSConfigured) {
    return mockRehomingDogs.find((dog) => dog.id === contentId);
  }

  try {
    const dog = await client.get<MCRehomingDog>({
      endpoint: "rehoming",
      contentId,
      customRequestInit: {
        next: { tags: [`get-rehoming-dog-${contentId}`], revalidate },
      },
    });
    return newRehomingDogFromMC(dog);
  } catch (error) {
    console.error(`microCMSからの里親募集犬の取得に失敗しました (${contentId}):`, error);
    return undefined;
  }
};
