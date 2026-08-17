import { kennelInfo } from "@/app/_data/kennelInfo";

type Article = {
  title: string;
  body: string;
  items?: string[];
};

/**
 * 利用規約。dog_breeder_ran の Terms.tsx をベースにしたドラフト。
 * TODO: 公開前に事業者側での内容確認を行うこと。
 */
const articles: Article[] = [
  {
    title: "第1条（適用）",
    body: `本規約は、${kennelInfo.name}（以下「当犬舎」といいます。）が提供するサービスの利用条件を定めるものです。利用者は本規約に従って本サービスを利用するものとします。`,
  },
  {
    title: "第2条（利用規約の変更）",
    body: "当犬舎は、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を継続した場合には、利用者は変更後の規約に同意したものとみなします。",
  },
  {
    title: "第3条（禁止事項）",
    body: "利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。",
    items: [
      "法令または公序良俗に違反する行為",
      "犯罪行為に関連する行為",
      "当犬舎のサービスの運営を妨害する行為",
      "他者の権利を侵害する行為",
      "その他、当犬舎が不適切と判断する行為",
    ],
  },
  {
    title: "第4条（著作権）",
    body: "本ウェブサイトに掲載されているすべての文章・画像・ロゴ・その他コンテンツの著作権は、運営者（または正当な権利者）に帰属します。無断での転載、複製、改変、再配布、販売等の行為を禁止します。",
  },
  {
    title: "第5条（サービス内容の変更・停止）",
    body: "当犬舎は、利用者に通知することなく、本サービスの内容を変更しまたは提供を停止することができるものとし、これによって利用者に生じた損害について一切の責任を負いません。",
  },
  {
    title: "第6条（免責事項）",
    body: "当犬舎は、本サービスに関して利用者に生じたいかなる損害についても、一切の責任を負わないものとします。ただし、当犬舎の故意または重過失による場合は、この限りではありません。",
  },
  {
    title: "第7条（サービス利用契約の解除）",
    body: "当犬舎は、利用者が本規約に違反した場合には、事前の通知なく本サービスの利用を停止し、サービス利用契約を解除することができるものとします。",
  },
  {
    title: "第8条（準拠法・裁判管轄）",
    body: "本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当犬舎の所在地を管轄する裁判所を専属的合意管轄とします。",
  },
];

export const Terms = () => (
  <div
    id="terms"
    className="measure-700 rounded-[30px] bg-white px-6 py-10 shadow-pop md:px-[50px] md:py-12"
  >
    <h2 className="font-jp text-[18px] font-extrabold leading-[1.6] text-ink-light md:text-[20px]">
      利用規約
    </h2>

    <div className="mt-6 flex flex-col gap-8">
      {articles.map((article) => (
        <section key={article.title} className="flex flex-col gap-2">
          <h3 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
            {article.title}
          </h3>
          <p className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
            {article.body}
          </p>
          {article.items && (
            <ul className="flex flex-col gap-1 pl-1">
              {article.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]"
                >
                  <span
                    aria-hidden
                    className="mt-[10px] block h-[6px] w-[6px] shrink-0 rounded-full bg-pink"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  </div>
);

export default Terms;
