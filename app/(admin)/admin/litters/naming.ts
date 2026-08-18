/**
 * 仔犬の仮名。
 *
 * 「クッキー ④ ♂1」のように、母犬・何回目の出産・性別・連番で作る。
 * 現場では生まれた直後に個体名を決めないことが多いので、
 * まず頭数ぶんの器を作り、見分けがついたら名前を付ける運用にしている。
 *
 * 出産記録からの一括生成と、あとから1頭足す場合の両方でこの関数を使う。
 * 別々に書くと採番の形がずれ、同じ腹の中で名前の付き方が変わってしまう。
 */
const CIRCLED = ['', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

export const circled = (n: number) => CIRCLED[n] ?? `(${n})`;

export function draftPuppyName(damName: string, nth: number, sex: '♂' | '♀', index: number): string {
  return `${damName} ${circled(nth)} ${sex}${index}`;
}
