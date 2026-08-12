/** Figmaの犬種フィルターに合わせた並び順。表記もFigma準拠 */
export const breeds = [
  "マルチーズ",
  "ミックス",
  "チワワ",
  "ビションフリーぜ",
  "トイプードル",
] as const;

export type Breed = (typeof breeds)[number];
