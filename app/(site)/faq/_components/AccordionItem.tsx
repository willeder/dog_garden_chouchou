"use client";

import Image from "next/image";
import { useState } from "react";
import type { Faq } from "@/app/_model/faq";
import AnswerBlocks from "./AnswerBlocks";
import { trackFaqOpen } from "@/app/_lib/analytics";

/**
 * Figma: Q＆A_1 のアコーディオン
 * ヘッダー bg #F5F7CA / 回答部 bg WHITE / radius 10 / shadow 5px 5px 0
 */
export const AccordionItem = ({ faq, defaultOpen = false }: { faq: Faq; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <li className="measure-700 shadow-pop">
      <h3>
        <button
          type="button"
          onClick={() =>
            setIsOpen((current) => {
              // 開いたときだけ計測する（閉じる操作は送らない）
              if (!current) trackFaqOpen(faq.question);
              return !current;
            })
          }
          aria-expanded={isOpen}
          className={`flex w-full cursor-pointer items-center justify-between gap-6 bg-yellow-light px-6 py-[23px] text-left md:px-[34px] ${
            isOpen ? "rounded-t-[10px]" : "rounded-[10px]"
          }`}
        >
          <span className="flex items-center gap-4">
            <span aria-hidden className="font-en text-[24px] leading-none text-ink-light md:text-[32px]">
              Q
            </span>
            <span className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
              {faq.question}
            </span>
          </span>
          <Image
            src="/assets/faq-accordion-arrow.svg"
            alt=""
            aria-hidden
            width={28}
            height={13}
            className={`shrink-0 transition-[rotate] duration-200 ${isOpen ? "" : "rotate-180"}`}
          />
        </button>
      </h3>

      {isOpen && (
        <div className="rounded-b-[10px] bg-white px-6 py-8 md:px-[68px] md:py-[43px]">
          <AnswerBlocks blocks={faq.answer} />
        </div>
      )}
    </li>
  );
};

export default AccordionItem;
