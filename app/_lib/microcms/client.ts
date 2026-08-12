import { createClient } from "microcms-js-sdk";

export const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN ?? "";
export const apiKey = process.env.MICROCMS_API_KEY ?? "";

/** microCMSの環境変数が揃っているか。未設定時はモックデータにフォールバックする */
export const isMicroCMSConfigured = serviceDomain !== "" && apiKey !== "";

export const client = createClient({
  serviceDomain: serviceDomain || "dummy",
  apiKey: apiKey || "dummy",
});
