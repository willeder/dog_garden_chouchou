import { SUPABASE_URL } from "./config";

export const PUBLIC_BUCKET = "dogs-public" as const;
export const PRIVATE_BUCKET = "dogs-private" as const;

export type PhotoBucket = typeof PUBLIC_BUCKET | typeof PRIVATE_BUCKET;

/**
 * 公開バケットの画像URL。バケットが public なので署名は不要で、
 * URLが変わらないため Next.js の画像最適化とISRに乗る。
 */
export function publicPhotoUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${PUBLIC_BUCKET}/${path}`;
}

/**
 * 保存先のパス。
 * 犬ごとのフォルダに入れ、ファイル名は推測できない値にする。
 * 元のファイル名は使わない（日本語や空白が混ざると扱いが面倒になる）。
 */
export function newPhotoPath(dogId: string, fileName: string): string {
  const ext = (fileName.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${dogId}/${crypto.randomUUID()}.${ext || "jpg"}`;
}

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/** 公開バケットの上限。Supabase側にも同じ制限を入れてある */
export const MAX_PUBLIC_BYTES = 10 * 1024 * 1024;
