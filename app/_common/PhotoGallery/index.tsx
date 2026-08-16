"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageWithSize } from "@/app/_model/image";
import type { Status } from "@/app/_model/puppy";
import StatusBadge from "@/app/_common/ui/StatusBadge";

type PhotoGalleryProps = {
  images: ImageWithSize[];
  alt: string;
  /** 指定するとメイン画像の左上にステータスを重ねる */
  status?: Status;
};

/**
 * 写真ギャラリー。構成は dog_breeder_ran の pictures.tsx に合わせている。
 *  - メイン写真は 4:3 の枠に object-contain（トリミングせず全体を見せる）
 *  - サムネイルは折り返しの一覧。選択中は枠線で示す
 */
export const PhotoGallery = ({ images, alt, status }: PhotoGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-[4/3] w-full rounded-[10px] bg-placeholder" />;
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {/* メイン写真：写真の縦横比を問わず全体が見えるように contain */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-beige">
        <Image
          src={images[activeIndex].url}
          alt={alt}
          fill
          sizes="(min-width: 768px) 640px, 100vw"
          priority
          className="object-contain object-center"
          draggable={false}
        />
        {status && <StatusBadge status={status} />}
      </div>

      {images.length > 1 && (
        <ul className="flex w-full flex-wrap">
          {images.map((image, index) => (
            <li key={`${image.url}-${index}`} className="w-1/4 p-[2px] sm:w-1/5">
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`${index + 1}枚目の写真を表示`}
                aria-current={index === activeIndex}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-[6px] transition-all ${
                  index === activeIndex
                    ? "ring-2 ring-pink"
                    : "opacity-70 hover:opacity-100 hover:ring-1 hover:ring-pink"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover object-center"
                  draggable={false}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PhotoGallery;
