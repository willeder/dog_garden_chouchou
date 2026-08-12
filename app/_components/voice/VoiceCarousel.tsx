"use client";

import Image from "next/image";
import { useState } from "react";
import type { Voice } from "@/app/_model/voice";

type VoiceCarouselProps = {
  voices: Voice[];
};

/** Figma: TOP_PC / THANKYOU のカード（240×273）を3枚ずつ表示するカルーセル */
export const VoiceCarousel = ({ voices }: VoiceCarouselProps) => {
  const [startIndex, setStartIndex] = useState(0);
  const total = voices.length;

  if (total === 0) return null;

  const visible = [0, 1, 2].map((offset) => voices[(startIndex + offset) % total]);
  const move = (direction: -1 | 1) =>
    setStartIndex((current) => (current + direction + total) % total);

  return (
    <div className="flex w-full items-center justify-center gap-4 lg:gap-8">
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="前のお客様の声へ"
        className="shrink-0 p-2 transition-opacity hover:opacity-60"
      >
        <Image src="/assets/top-voice-arrow-left.svg" alt="" aria-hidden width={14} height={36} />
      </button>

      <ul className="flex items-center justify-center gap-4 lg:gap-8">
        {visible.map((voice, index) => (
          <li
            key={`${voice.id}-${index}`}
            className={[
              "w-[240px] shrink-0 overflow-hidden rounded-[10px] bg-white pb-2 shadow-pop",
              index === 1 ? "hidden sm:block" : "",
              index === 2 ? "hidden lg:block" : "",
            ].join(" ")}
          >
            <div className="relative h-[213px] w-full">
              {voice.image ? (
                <Image
                  src={voice.image.url}
                  alt=""
                  fill
                  sizes="240px"
                  className="object-cover object-bottom"
                />
              ) : (
                <div className="h-full w-full bg-placeholder" />
              )}
            </div>
            <p className="mx-auto mt-2 w-[213px] font-jp text-[14px] leading-[1.6] text-ink-light">
              {voice.title}
            </p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => move(1)}
        aria-label="次のお客様の声へ"
        className="shrink-0 p-2 transition-opacity hover:opacity-60"
      >
        <Image src="/assets/top-voice-arrow-right.svg" alt="" aria-hidden width={14} height={36} />
      </button>
    </div>
  );
};

export default VoiceCarousel;
