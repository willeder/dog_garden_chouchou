import { MicroCMSListResponse } from "microcms-js-sdk";

export type ListMeta = Omit<MicroCMSListResponse<object>, "contents">;

/** YYYY-MM-DDTHH:mm:ss.sssZ */
export type DateStringResponse = string;

export type ImageResponse = {
  url: string;
  width: number;
  height: number;
};

export type SexResponse = "男の子" | "女の子";
