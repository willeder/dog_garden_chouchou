import { Faq } from "@/app/_model/faq";

const dummyQuestion = "テキスト入ります。テキスト入ります。テキスト入ります。";
const dummyAnswer =
  "テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。テキスト入ります。";

/**
 * よくある質問。
 * TODO: Figma上は全問ダミーテキストのため、実際の質問・回答をクライアントから受領後に差し替える。
 */
export const faqs: Faq[] = Array.from({ length: 6 }, (_, index) => ({
  id: `faq-${index + 1}`,
  question: dummyQuestion,
  answer: dummyAnswer,
}));
