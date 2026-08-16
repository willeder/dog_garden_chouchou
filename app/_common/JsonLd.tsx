/**
 * 構造化データ（JSON-LD）を出力する。
 * `<` をエスケープしてスクリプト終端の誤検出／XSSを防ぐ。
 */
export const JsonLd = ({ data }: { data: object | object[] }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
);

export default JsonLd;
