/**
 * 回答本文のブロック。
 * クライアント支給原稿の見出し・箇条書き・締めの文を、そのままの構造で表現するための型。
 */
export type FaqBlock =
  /** 通常の段落。\n は原稿の改行としてそのまま反映される */
  | { type: "text"; text: string }
  /** 回答内の小見出し（原稿の絵文字つき見出し） */
  | { type: "heading"; emoji?: string; text: string }
  /** 箇条書き */
  | { type: "list"; items: string[] }
  /** 回答の締めに置く補足ブロック（ベージュの囲み） */
  | { type: "note"; emoji?: string; texts: string[] };

export type Faq = {
  id: string;
  question: string;
  answer: FaqBlock[];
};
