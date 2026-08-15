/**
 * microCMSの日付文字列（YYYY-MM-DDTHH:mm:ss.sssZ）を
 * 日本時間の日付として解釈する（dog_breeder_ran の parseLocalDate と同じ挙動）
 */
export const parseLocalDate = (value: string): Date => {
  const utcDate = new Date(value);
  const jstOffsetMinutes = 9 * 60;
  const jstDate = new Date(utcDate.getTime() + jstOffsetMinutes * 60 * 1000);
  return new Date(jstDate.getUTCFullYear(), jstDate.getUTCMonth(), jstDate.getUTCDate());
};

export const formatYear = (date: Date): string => `${date.getFullYear()}`;
export const formatMonth = (date: Date): string => `${date.getMonth() + 1}`;
export const formatDay = (date: Date): string => `${date.getDate()}`;

/** 2024年1月1日 の形式 */
export const formatJpDate = (date: Date): string =>
  `${formatYear(date)}年${formatMonth(date)}月${formatDay(date)}日`;

/** 2024年1月1日生 の形式（スペック表） */
export const formatBirthdayWithSuffix = (date: Date): string => `${formatJpDate(date)}生`;

/** 2024年1月1日生まれ の形式（カード） */
export const formatBirthday = (date: Date): string => `${formatJpDate(date)}生まれ`;

/** 生後日数 */
export const calculateAgeInDays = (birthday: Date): number =>
  Math.floor((Date.now() - birthday.getTime()) / (1000 * 60 * 60 * 24));

/**
 * 生後の表示。
 * ※ サーバー側で算出するため、ISRの再生成タイミング（既定1時間）で更新される。
 */
export const formatAge = (birthday: Date): string => {
  const days = calculateAgeInDays(birthday);
  if (days < 0) return "未誕生";
  if (days < 31) return `${days}日`;

  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years > 0) return months === 0 ? `${years}歳` : `${years}歳${months}ヶ月`;
  return `${months}ヶ月`;
};
