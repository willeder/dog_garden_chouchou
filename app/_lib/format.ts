/** 230000 → 230,000円 */
export const formatPrice = (price?: number): string =>
  price === undefined ? "応相談" : `${price.toLocaleString("ja-JP")}円`;
