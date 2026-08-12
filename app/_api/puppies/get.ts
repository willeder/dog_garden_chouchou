import { GetRequest } from "microcms-js-sdk";
import { client, isMicroCMSConfigured } from "@/app/_lib/microcms/client";
import { Puppy } from "@/app/_model/puppy";
import { MCPuppy, newPuppiesFromResponseContents, newPuppyFromMC } from "./response";
import { defaultItemLimit, defaultRevalidateTime } from "@/app/_config/isr";
import { mockPuppies } from "@/app/_data/mockPuppies";

const revalidate = defaultRevalidateTime;

/**
 * 仔犬一覧を取得する。
 * microCMSの環境変数が未設定の場合はモックデータを返すため、
 * APIキーが無い状態でもビルド・開発サーバーが動作する。
 */
export const getPuppies = async (
  params?: Omit<GetRequest, "endpoint">
): Promise<Puppy[]> => {
  if (!isMicroCMSConfigured) return mockPuppies;

  try {
    const { contents } = await client.getList<MCPuppy>({
      endpoint: "puppies",
      queries: { limit: defaultItemLimit },
      customRequestInit: { next: { tags: ["get-puppies"], revalidate } },
      ...params,
    });
    return newPuppiesFromResponseContents(contents);
  } catch (error) {
    console.error("microCMSからの仔犬一覧取得に失敗しました:", error);
    return mockPuppies;
  }
};

/** 仔犬1件を取得する */
export const getPuppy = async (contentId: string): Promise<Puppy | undefined> => {
  if (!isMicroCMSConfigured) {
    return mockPuppies.find((puppy) => puppy.id === contentId);
  }

  try {
    const puppy = await client.get<MCPuppy>({
      endpoint: "puppies",
      contentId,
      customRequestInit: {
        next: { tags: [`get-puppy-${contentId}`], revalidate },
      },
    });
    return newPuppyFromMC(puppy);
  } catch (error) {
    console.error(`microCMSからの仔犬取得に失敗しました (${contentId}):`, error);
    return undefined;
  }
};
