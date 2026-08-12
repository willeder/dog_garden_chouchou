/**
 * microCMSの日付文字列（YYYY-MM-DDTHH:mm:ss.sssZ）を
 * タイムゾーンのズレなくローカル日付として解釈する
 */
export const parseLocalDate = (value: string): Date => {
  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

/** 2024年1月1日 の形式 */
export const formatJpDate = (date: Date): string =>
  `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

/** 2024年1月1日生 の形式（仔犬詳細のスペック表） */
export const formatBirthdayWithSuffix = (date: Date): string =>
  `${formatJpDate(date)}生`;

/** 2023年12月8日生まれ の形式（仔犬カード） */
export const formatBirthday = (date: Date): string =>
  `${formatJpDate(date)}生まれ`;
