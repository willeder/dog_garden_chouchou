import { kennelInfo } from "@/app/_data/kennelInfo";

type Section = {
  title: string;
  body?: string;
  items?: string[];
};

const sections: Section[] = [
  {
    title: "1. 個人情報の収集・利用目的",
    body: "当犬舎は、以下の目的で個人情報を収集・利用いたします。",
    items: [
      "見学のお申し込みの受付・管理",
      "お問い合わせへの対応",
      "仔犬のお迎え・里親募集に関するご連絡および情報提供",
      "お迎え後のアフターフォロー",
      "サービス改善のための分析",
    ],
  },
  {
    title: "2. 収集する個人情報",
    body: "当犬舎が収集する個人情報は、以下のとおりです。",
    items: [
      "氏名",
      "電話番号",
      "メールアドレス",
      "住所",
      "LINEのアカウント情報（表示名・アイコン等）",
      "その他、サービスを提供するうえで必要となる情報",
    ],
  },
  {
    title: "3. 個人情報の管理",
    body: "当犬舎は、個人情報の正確性および安全性確保のためにセキュリティ対策を講じ、個人情報の漏洩、滅失またはき損の防止に努めます。個人情報の取り扱いに関しては適切な管理を行い、特段の事情がない限り、個人情報を第三者に開示・提供することはありません。",
  },
  {
    title: "4. 個人情報の第三者提供",
    body: "当犬舎は、以下の場合を除き、あらかじめご本人の同意を得ることなく個人情報を第三者に提供することはありません。",
    items: [
      "法令に基づく場合",
      "人の生命、身体または財産の保護のために必要がある場合",
      "公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合",
    ],
  },
  {
    title: "5. 個人情報の開示・訂正・削除",
    body: "当犬舎は、ご本人から個人情報の開示・訂正・削除等の要請があった場合、本人確認のうえ、合理的な期間内に対応いたします。ご請求は下記のお問い合わせ窓口までご連絡ください。",
  },
  {
    title: "6. Cookieおよびアクセス解析について",
    body: "当サイトでは、ユーザー体験の向上およびサイトの利用状況の分析のためにCookieを使用し、Googleアナリティクスによるアクセス解析を行う場合があります。取得したデータは匿名で収集されており、個人を特定するものではありません。Cookieの使用を望まない場合は、ブラウザの設定から無効化できます。ただし、一部の機能が正常に動作しない場合があります。",
  },
  {
    title: "7. プライバシーポリシーの変更",
    body: "当犬舎は、必要に応じて本プライバシーポリシーの内容を変更することがあります。変更した場合は、当サイト上に変更後のプライバシーポリシーを掲載します。",
  },
];

/**
 * TODO: 屋号・住所・連絡先はクライアント確認後に kennelInfo へ反映すること。
 * 掲載前に事業者側での内容確認を推奨します。
 */
export const PrivacyPolicy = () => (
  <div className="measure-700 rounded-[30px] bg-white px-6 py-10 shadow-pop md:px-[50px] md:py-12">
    <div className="flex flex-col gap-8">
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
            {section.title}
          </h2>
          {section.body && (
            <p className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
              {section.body}
            </p>
          )}
          {section.items && (
            <ul className="flex flex-col gap-1 pl-1">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]"
                >
                  <span aria-hidden className="mt-[10px] block h-[6px] w-[6px] shrink-0 rounded-full bg-pink" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="flex flex-col gap-2">
        <h2 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
          8. お問い合わせ窓口
        </h2>
        <p className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
          個人情報の取扱いに関するお問い合わせは、公式LINEまたは以下の窓口までご連絡ください。
        </p>
        <div className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
          <p className="font-extrabold">{kennelInfo.name}</p>
          {kennelInfo.postalCode && kennelInfo.address && (
            <p>
              〒{kennelInfo.postalCode} {kennelInfo.address}
            </p>
          )}
          {kennelInfo.email && <p>Email: {kennelInfo.email}</p>}
        </div>
      </section>
    </div>
  </div>
);

export default PrivacyPolicy;
