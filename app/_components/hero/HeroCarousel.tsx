"use client";

import Image from "next/image";
import { useState } from "react";
import { heroSlides } from "./data";

/**
 * Figma: TOP_PC / Frame 28
 * 花びら型にマスクした写真（254×254）を3枚並べ、左右の矢印で送る
 */
export const HeroCarousel = () => {
  const [startIndex, setStartIndex] = useState(0);
  const total = heroSlides.length;

  const visible = [0, 1, 2].map((offset) => heroSlides[(startIndex + offset) % total]);

  const move = (direction: -1 | 1) =>
    setStartIndex((current) => (current + direction + total) % total);

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-12">
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="前の写真へ"
        className="shrink-0 p-2 transition-opacity hover:opacity-60"
      >
        <Image src="/assets/arrow-left.svg" alt="" aria-hidden width={14} height={36} />
      </button>

      <ul className="flex items-center justify-center gap-4 sm:gap-6">
        {visible.map((slide, index) => (
          <li
            key={`${slide.src}-${index}`}
            className={[
              "relative aspect-square w-[180px] shrink-0 drop-shadow-pop sm:w-[200px] lg:w-[254px]",
              index === 0 ? "" : "hidden sm:block",
              index === 2 ? "hidden lg:block" : "",
            ].join(" ")}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="254px"
              priority={index === 0}
              className="mask-flower object-cover object-bottom"
            />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => move(1)}
        aria-label="次の写真へ"
        className="shrink-0 p-2 transition-opacity hover:opacity-60"
      >
        <Image src="/assets/arrow-right.svg" alt="" aria-hidden width={14} height={36} />
      </button>
    </div>
  );
};

export default HeroCarousel;
