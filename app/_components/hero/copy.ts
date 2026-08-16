import { kennelInfo } from "@/app/_data/kennelInfo";

/** TODO: キャッチコピーはFigmaに無いため暫定。クライアント確認のうえ差し替える */
export const heroCopy = {
  main: "あなたの家族になる日を、\n待っています。",
  sub: "家庭的な環境で、たくさんの愛情に包まれて育っています。",
  /**
   * ページ唯一の <h1>。検索エンジンに「どこの何屋か」を最初に伝える行。
   * 犬舎名（指名検索）＋地域＋業種（地域検索）を1行に収めている。
   */
  h1: `${kennelInfo.name}｜福岡県筑紫野市のブリーダー`,
};
