"use client";

import Image from "next/image";
import { useState } from "react";
import type { WarrantyItem } from "@/app/_data/warrantyData";

/**
 * 生体保証のアコーディオン。
 * Q＆Aページと同じトンマナ（ヘッダー #F5F7CA / 本文 白 / radius 10 / shadow 5px 5px 0）
 */
export const WarrantyCard = ({
  item,
  defaultOpen = false,
}: {
  item: WarrantyItem;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <li className="measure-700 shadow-pop">
      <h3>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          className={`flex w-full cursor-pointer items-center justify-between gap-6 bg-yellow-light px-6 py-[23px] text-left md:px-[34px] ${
            isOpen ? "rounded-t-[10px]" : "rounded-[10px]"
          }`}
        >
          <span className="font-jp text-[14px] font-extrabold leading-[1.6] text-ink-light md:text-[16px]">
            {item.title}
          </span>
          <Image
            src="/assets/faq-accordion-arrow.svg"
            alt=""
            aria-hidden
            width={28}
            height={13}
            className={`shrink-0 transition-transform ${isOpen ? "" : "rotate-180"}`}
          />
        </button>
      </h3>

      {isOpen && (
        <div className="flex flex-col gap-6 rounded-b-[10px] bg-white px-6 py-8 md:px-[50px] md:py-[43px]">
          {item.description && (
            <div className="flex flex-col gap-1">
              {item.description.map((text) => (
                <p
                  key={text}
                  className="font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]"
                >
                  {text}
                </p>
              ))}
            </div>
          )}

          {item.categories?.map((category) => (
            <div key={category.title} className="flex flex-col gap-2">
              <h4 className="font-jp text-[14px] font-extrabold leading-[1.6] text-ink-light md:text-[16px]">
                {category.title}
              </h4>
              <ul className="flex flex-col gap-1">
                {category.items.map((text) => {
                  // 先頭がハイフンの項目はサブ項目として字下げする
                  const isSubItem = text.startsWith("-");
                  const label = isSubItem ? text.slice(1).trim() : text;
                  return (
                    <li
                      key={text}
                      className={`flex items-start gap-2 font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px] ${
                        isSubItem ? "pl-5" : ""
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`mt-[10px] block h-[6px] w-[6px] shrink-0 rounded-full ${
                          isSubItem ? "bg-green" : "bg-pink"
                        }`}
                      />
                      <span>{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </li>
  );
};

export default WarrantyCard;
