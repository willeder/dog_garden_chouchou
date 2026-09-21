import { kennelInfo } from "@/app/_data/kennelInfo";

/**
 * 仔犬の「お問い合わせ番号」。
 * 仔犬のIDの先頭8文字を大文字にしたもの（例: F0829A00）。
 * LINEで送られてきた番号から、管理画面の検索で同じ子を引ける。
 * 以前はID全体（36文字）を出しており、読み上げも照合もできなかった。
 */
export const inquiryCode = (puppyId: string): string =>
  puppyId.replace(/-/g, "").slice(0, 8).toUpperCase();

/** 8文字の16進数か（管理画面の検索でお問い合わせ番号として扱う） */
export const isInquiryCode = (v: string): boolean => /^[0-9a-f]{8}$/i.test(v.trim());

/**
 * 公式LINEのトークを、メッセージ入力済みの状態で開くURL。
 * LINEの公式な仕組み（https://line.me/R/oaMessage/{LINE ID}/?{本文}）を使う。
 * 送信は相手が押すまで行われないので、内容は書き換えてから送れる。
 */
export const lineMessageUrl = (text: string): string | null => {
  const id = kennelInfo.sns.line?.id;
  if (!id) return null;
  return `https://line.me/R/oaMessage/${encodeURIComponent(id)}/?${encodeURIComponent(text)}`;
};
