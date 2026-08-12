"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageWithSize } from "@/app/_model/image";

type PuppyGalleryProps = {
  images: ImageWithSize[];
  alt: string;
};

/** Figma: PUPPYINFO_detail_2（メイン704×350 ＋ サムネイル83×99×5 ＋ 左右矢印） */
export const PuppyGallery = ({ images, alt }: PuppyGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="measure-700 aspect-[704/350] w-full bg-placeholder" />;
  }

  const move = (direction: -1 | 1) =>
    setActiveIndex((current) => (current + direction + images.length) % images.length);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative aspect-[704/350] w-full max-w-[704px]">
        <Image
          src={images[activeIndex].url}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 704px, 100vw"
          priority
          className="object-cover object-bottom"
        />
      </div>

      {images.length > 1 && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="前の写真へ"
            className="shrink-0 p-1 transition-opacity hover:opacity-60"
          >
            <Image
              src="/assets/puppy-detail-arrow-left.svg"
              alt=""
              aria-hidden
              width={26}
              height={23}
            />
          </button>

          <ul className="flex items-center gap-4">
            {images.map((image, index) => (
              <li key={image.url + index}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`${index + 1}枚目の写真を表示`}
                  aria-current={index === activeIndex}
                  className={`relative block h-[99px] w-[83px] transition-opacity ${
                    index === activeIndex ? "opacity-100" : "opacity-60 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="83px"
                    className="object-cover object-bottom"
                  />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => move(1)}
            aria-label="次の写真へ"
            className="shrink-0 p-1 transition-opacity hover:opacity-60"
          >
            <Image
              src="/assets/puppy-detail-arrow-right.svg"
              alt=""
              aria-hidden
              width={26}
              height={23}
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default PuppyGallery;
