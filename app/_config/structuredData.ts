import { kennelInfo } from "../_data/kennelInfo";
import type { Puppy } from "../_model/puppy";
import { absoluteUrl, ogImagePath } from "./site";

/**
 * 構造化データ（JSON-LD）のビルダー。
 *
 * 対応タイプの選定根拠（Google Search Central「構造化データギャラリー」2026年8月時点）:
 *  - Organization / LocalBusiness / BreadcrumbList / Product … 現在もサポート対象
 *  - FAQPage … 2026年5月7日にリッチリザルトの提供終了。実装しても検索結果に影響しないため採用しない
 *    （FAQ本文はユーザーにとって有用なのでページ上の表示は維持する）
 */

/** schema.org の PetStore は LocalBusiness のサブタイプ。ブリーダー犬舎はこれが最も近い */
const businessType = ["LocalBusiness", "PetStore"];

const sameAs = [
  kennelInfo.sns.instagram,
  kennelInfo.sns.tiktok,
  kennelInfo.externalProfiles?.minnaNoBreeder,
].filter((url): url is string => Boolean(url));

/**
 * トップページに出す犬舎そのものの情報。
 * 犬舎名で検索したときに「この公式サイトがその犬舎の本体である」とGoogleに伝えるのが目的。
 */
export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": businessType,
  "@id": absoluteUrl("/#organization"),
  name: kennelInfo.name,
  alternateName: [kennelInfo.nameEn, kennelInfo.animalBusiness.officeName].filter(Boolean),
  url: absoluteUrl("/"),
  image: absoluteUrl(ogImagePath),
  logo: absoluteUrl("/assets/logo.svg"),
  description: kennelInfo.description,
  ...(kennelInfo.email ? { email: kennelInfo.email } : {}),
  address: {
    "@type": "PostalAddress",
    addressCountry: "JP",
    addressRegion: "福岡県",
    addressLocality: "筑紫野市",
    streetAddress: kennelInfo.address.replace(/^福岡県筑紫野市/, ""),
    ...(kennelInfo.postalCode ? { postalCode: kennelInfo.postalCode } : {}),
  },
  founder: { "@type": "Person", name: kennelInfo.breeder },
  ...(sameAs.length ? { sameAs } : {}),
  knowsAbout: [
    "マルチーズ",
    "チワワ",
    "トイプードル",
    "ビションフリーゼ",
    "ミックス犬",
    "犬のブリーディング",
    "里親募集",
  ],
  // 第一種動物取扱業の登録番号。行政登録の裏付けとして信頼性シグナルになる
  ...(kennelInfo.animalBusiness.registrationNumber
    ? {
        identifier: {
          "@type": "PropertyValue",
          name: kennelInfo.animalBusiness.registrationType,
          value: kennelInfo.animalBusiness.registrationNumber,
        },
      }
    : {}),
});

/** サイト全体を表す WebSite。サイト名の表示（サイトネーム）に使われる */
export const webSiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  url: absoluteUrl("/"),
  name: kennelInfo.name,
  alternateName: kennelInfo.nameEn,
  inLanguage: "ja",
  publisher: { "@id": absoluteUrl("/#organization") },
});

export type Crumb = { name: string; path: string };

/** パンくずリスト。検索結果のURL表示が階層表示になり、クリック率が上がる */
export const breadcrumbJsonLd = (crumbs: Crumb[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "ホーム", path: "/" }, ...crumbs].map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path === "/" ? "/" : crumb.path),
  })),
});

/**
 * 仔犬1頭ぶんの Product。
 * 価格が未設定の場合は offers を出さない（価格の無い offers は無効な構造化データになるため）。
 */
export const puppyJsonLd = (puppy: Puppy) => {
  const name = `${puppy.breed}（${puppy.sex}）`;
  const url = absoluteUrl(`/puppies/${puppy.id}`);

  const availability =
    puppy.status === "成約済み"
      ? "https://schema.org/SoldOut"
      : puppy.status === "商談中"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/InStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name,
    url,
    ...(puppy.message ? { description: puppy.message } : {}),
    image: puppy.images.map((image) => image.url),
    category: puppy.breed,
    color: puppy.color,
    brand: { "@id": absoluteUrl("/#organization") },
    additionalProperty: [
      { "@type": "PropertyValue", name: "犬種", value: puppy.breed },
      { "@type": "PropertyValue", name: "性別", value: puppy.sex },
      ...(puppy.expectedWeight
        ? [
            {
              "@type": "PropertyValue",
              name: "成犬時予想体重",
              value: `${puppy.expectedWeight}kg以下`,
            },
          ]
        : []),
    ],
    // 成約済みの子は画面上も価格を出さないため、構造化データからも offers ごと省く
    // （表示と構造化データが食い違うとGoogleのスパムポリシー違反になり得る）
    ...(puppy.price && puppy.status !== "成約済み"
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: puppy.price,
            priceCurrency: "JPY",
            availability,
            seller: { "@id": absoluteUrl("/#organization") },
          },
        }
      : {}),
  };
};
