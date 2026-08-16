import Image from "next/image";
import Icon from "@/app/_common/ui/Icon";
import TrackedButton from "@/app/_common/ui/TrackedButton";
import { kennelInfo } from "@/app/_data/kennelInfo";

/**
 * お問い合わせ導線（公式LINE）。
 * Figma CONTACT US の白カード（700px / radius 30 / shadow 5px 5px 0）の中身として使用する。
 */
type LineGuideProps = {
  /** GA4のクリック計測用。どのページに置かれた導線かを識別する */
  location?: string;
};

export const LineGuide = ({ location = "line_guide" }: LineGuideProps) => {
  const { line } = kennelInfo.sns;

  return (
    <div className="measure-700 rounded-[30px] bg-white px-6 py-10 shadow-pop md:px-[50px] md:py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-green text-white">
          <Icon type="line" size={32} />
        </span>
        <h3 className="font-jp text-[16px] font-extrabold leading-[1.6] text-ink-light md:text-[18px]">
          お問い合わせ・見学のお申し込みは
          <br className="md:hidden" />
          公式LINEにて承ります
        </h3>
        <p className="measure-560 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
          仔犬のお迎えや里親のご相談、見学のお申し込みは、すべて公式LINEで受け付けています。
          下記から友だち追加のうえ、メッセージをお送りください。順次ご返信いたします。
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {/* スマートフォン向け: ボタン */}
        <div className="rounded-[10px] bg-beige px-6 py-6">
          <p className="inline-block rounded-[5px] bg-pink px-3 py-1 font-jp text-[12px] font-extrabold leading-[1.6] text-white">
            スマートフォンでご覧の方
          </p>
          <p className="mt-2 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
            下のボタンをタップして、LINEアカウントページからご登録ください。
          </p>
          <div className="mt-4 flex flex-col items-start gap-2">
            {line?.url ? (
              <TrackedButton href={line.url} kind="line" location={location} variant="green" font="jp">
                LINEで友だち追加する
              </TrackedButton>
            ) : (
              // TODO: kennelInfo.sns.line.url に公式LINEのURLを設定すると友だち追加ボタンが表示されます
              <p className="font-jp text-[14px] leading-[1.6] text-ink-light">
                公式LINEのURLを設定してください。
              </p>
            )}
            {line?.id && (
              <p className="font-jp text-[12px] leading-[1.6] text-ink-light">
                LINE ID: {line.id}
              </p>
            )}
          </div>
        </div>

        {/* PC向け: QRコード（画像が設定されている場合のみ表示） */}
        {line?.qrImage && (
          <div className="flex flex-col items-center gap-6 rounded-[10px] bg-beige px-6 py-6 sm:flex-row">
            <div className="shrink-0 rounded-[10px] bg-white p-3">
              <Image
                src={line.qrImage}
                alt="LINE友だち追加用QRコード"
                width={160}
                height={160}
                draggable={false}
              />
            </div>
            <div>
              <p className="inline-block rounded-[5px] bg-pink px-3 py-1 font-jp text-[12px] font-extrabold leading-[1.6] text-white">
                PCでご覧の方
              </p>
              <p className="mt-2 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
                LINEアプリの「友だち追加」→「QRコード」から、こちらのQRコードを読み込んでご登録ください。
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 border-t border-pink pt-6 text-center">
        <p className="font-jp text-[14px] leading-[1.6] text-ink-light">
          お問い合わせの前に、よくある質問もご確認ください。
        </p>
        <TrackedButton
          href="/faq"
          kind="cta"
          location={`${location}_faq`}
          label="よくある質問を見る"
          variant="pink"
          font="jp"
        >
          よくある質問を見る
        </TrackedButton>
      </div>
    </div>
  );
};

export default LineGuide;
