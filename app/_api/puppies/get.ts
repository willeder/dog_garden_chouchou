import { Puppy } from "@/app/_model/puppy";
import { publicClient, isSupabaseConfigured } from "@/app/_lib/supabase/public";
import { SBPuppy, newPuppiesFromSB, newPuppyFromSB } from "./supabaseResponse";
import { defaultItemLimit } from "@/app/_config/isr";

/**
 * 仔犬の取得。データ元は Supabase の v_public_puppies。
 *
 * microCMS の puppies / parents は廃止した。犬舎の台帳（管理アプリ）に
 * 一本化することで、同じ犬の情報を2か所で管理しなくて済む。
 * 管理アプリで「サイトに出す」を立てた仔犬だけがここに現れる。
 *
 * 再検証はページ側の `export const revalidate` に任せる。
 * ここで独自にキャッシュを持つと、公開を止めたのにサイトに残る事故が起きる。
 */

const SELECT = `
  id, name, sex, birthday, status,
  breed_name, breed_explanation, color_name, coat_type_name,
  weight_kg, expected_weight_kg, expected_height_cm,
  list_price, public_message, created_at,
  photos, mother, father
`;

/** 仔犬一覧。新しい子が先。 */
export const getPuppies = async (): Promise<Puppy[]> => {
  if (!isSupabaseConfigured) {
    // 環境変数が無い状態でもビルドと開発サーバーは通す。
    console.warn("Supabaseの環境変数が未設定のため、仔犬一覧を空で返します");
    return [];
  }

  const { data, error } = await publicClient
    .from("v_public_puppies")
    .select(SELECT)
    .order("birthday", { ascending: false, nullsFirst: false })
    .limit(defaultItemLimit);

  if (error) {
    console.error("Supabaseからの仔犬一覧取得に失敗しました:", error.message);
    return [];
  }

  return newPuppiesFromSB((data ?? []) as unknown as SBPuppy[]);
};

/** 仔犬1件。見つからなければ undefined（呼び出し側で notFound にする） */
export const getPuppy = async (id: string): Promise<Puppy | undefined> => {
  if (!isSupabaseConfigured) return undefined;

  // UUID以外が来たら問い合わせない。存在しないIDでのエラーログを増やさないため。
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return undefined;
  }

  const { data, error } = await publicClient
    .from("v_public_puppies")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`Supabaseからの仔犬取得に失敗しました (${id}):`, error.message);
    return undefined;
  }
  if (!data) return undefined;

  return newPuppyFromSB(data as unknown as SBPuppy);
};
