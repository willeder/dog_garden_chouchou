"use client";

import { useState } from "react";
import Button from "@/app/_common/ui/Button";
import { trackEvent } from "@/app/_lib/analytics";

/**
 * 「この子についてLINEで問い合わせる」。
 *
 * 押すと公式LINEのトークが、この子の情報（お問い合わせ番号・犬種・性別・誕生日・ページURL）を
 * 入力した状態で開く。お客様は「送信」を押すだけで、犬舎側はどの子の問い合わせかがすぐ分かる。
 * 以前はお問い合わせページ経由で友だち追加するだけで、どの子を見ていたかが伝わらなかった。
 *
 * PCではLINEアプリが開かないことがあるので、番号と文面をコピーできるようにしておく。
 */
export function LineInquiry({
  puppyId,
  code,
  lineUrl,
  message,
  fallbackUrl,
  location,
  compact = false,
}: {
  puppyId: string;
  code: string;
  /** メッセージ入力済みで開くURL。LINE IDが未設定なら null */
  lineUrl: string | null;
  message: string;
  /** lineUrl が無いときの行き先（友だち追加・お問い合わせページ） */
  fallbackUrl: string;
  location: string;
  /** 画面下に固定する細いバー用 */
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = () =>
    trackEvent("puppy_line_inquiry_click", {
      puppy_id: puppyId,
      inquiry_code: code,
      link_location: location,
    });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
      trackEvent("puppy_inquiry_copy", { puppy_id: puppyId, inquiry_code: code });
    } catch {
      /* クリップボードが使えない環境では番号を見て伝えてもらう */
    }
  };

  const href = lineUrl ?? fallbackUrl;

  if (compact) {
    return (
      <Button href={href} variant="green" font="jp" className="w-full" onClick={onClick}>
        この子についてLINEで問い合わせる
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Button href={href} variant="green" font="jp" className="w-full" onClick={onClick}>
        この子についてLINEで問い合わせる
      </Button>
      <p className="font-jp text-[12px] leading-[1.7] text-ink-light">
        {lineUrl
          ? "この子の情報が入力された状態でLINEが開きます。そのまま送信してください。"
          : "LINEでお問い合わせの際は、下のお問い合わせ番号をお伝えください。"}
      </p>
      <div className="flex items-center gap-2 rounded-full bg-beige px-4 py-1.5">
        <span className="font-jp text-[12px] text-ink-light">お問い合わせ番号</span>
        <span className="font-mono text-[15px] font-bold tracking-wider text-ink">{code}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-full border border-ink-light/40 bg-white px-2.5 py-0.5 font-jp text-[11px] text-ink-light hover:opacity-80"
          aria-live="polite"
        >
          {copied ? "コピーしました" : "文面をコピー"}
        </button>
      </div>
      <p className="font-jp text-[11px] leading-[1.7] text-ink-light">
        PCなどでLINEが開かない場合は、文面をコピーしてLINEに貼り付けてください。
      </p>
    </div>
  );
}

export default LineInquiry;
