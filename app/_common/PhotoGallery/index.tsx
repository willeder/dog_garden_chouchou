"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageWithSize } from "@/app/_model/image";
import type { Status } from "@/app/_model/puppy";
import StatusBadge from "@/app/_common/ui/StatusBadge";
import { trackEvent } from "@/app/_lib/analytics";
import { Lightbox } from "./Lightbox";

type PhotoGalleryProps = {
  images: ImageWithSize[];
  alt: string;
  /** 指定するとメイン画像の左上にステータスを重ねる */
  status?: Status;
  /** 紹介動画のURL。あれば写真の最後に並べる */
  video?: string;
  /** 計測用（GA4）。どの子の写真が拡大されたか */
  puppyId?: string;
};

type Media = { kind: "photo"; image: ImageWithSize; photoIndex: number } | { kind: "video"; url: string };

/**
 * 仔犬の写真ギャラリー。
 *
 * 購入を考えている方が「この子をよく見たい」ときに困らないようにしている。
 *  - メイン写真は左右スワイプで送れる（PCは矢印ボタン）。何枚目かを常に出す
 *  - 写真を押すと全画面で開き、ピンチ・ダブルタップで拡大できる
 *  - 動画は写真の最後に並べ、サムネイルに再生マークを付けて見つけやすくする
 *  - 写真は object-contain（トリミングせず全体を見せる）
 */
export const PhotoGallery = ({ images, alt, status, video, puppyId }: PhotoGalleryProps) => {
  const media: Media[] = [
    ...images.map((image, photoIndex) => ({ kind: "photo" as const, image, photoIndex })),
    ...(video ? [{ kind: "video" as const, url: video }] : []),
  ];

  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);
  // 全画面で最後に見ていた写真。閉じたらメイン写真もそこに合わせる
  const lastViewed = useRef(0);

  const goTo = useCallback((i: number, smooth = true) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  };

  // 表示中の写真のサムネイルが隠れないようにする／動画から離れたら止める
  useEffect(() => {
    const thumb = thumbsRef.current?.children[active] as HTMLElement | undefined;
    thumb?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    trackRef.current?.querySelectorAll("video").forEach((v) => {
      if (!v.closest(`[data-index="${active}"]`)) v.pause();
    });
  }, [active]);

  // 画面の回転・リサイズで位置がずれないようにする
  useEffect(() => {
    const onResize = () => goTo(active, false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, goTo]);

  // 全画面表示は履歴に積む。スマホの「戻る」で閉じられ、ページから離れてしまわないように
  const openLightbox = (photoIndex: number) => {
    window.history.pushState({ ...(window.history.state ?? {}), puppyLightbox: true }, "");
    lastViewed.current = photoIndex;
    setLightboxAt(photoIndex);
    trackEvent("puppy_photo_zoom", { puppy_id: puppyId, photo_index: photoIndex + 1 });
  };
  useEffect(() => {
    if (lightboxAt === null) return;
    const onPop = () => {
      setLightboxAt(null);
      goTo(lastViewed.current, false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [lightboxAt, goTo]);
  const closeLightbox = useCallback(() => {
    if (window.history.state?.puppyLightbox) window.history.back();
    else {
      setLightboxAt(null);
      goTo(lastViewed.current, false);
    }
  }, [goTo]);

  if (media.length === 0) {
    return <div className="aspect-[4/3] w-full rounded-[10px] bg-placeholder" />;
  }

  const current = media[active] ?? media[0];

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-[10px] bg-beige [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="カルーセル"
          aria-label={`${alt}の写真`}
        >
          {media.map((m, i) => (
            <div
              key={m.kind === "photo" ? `${m.image.url}-${i}` : "video"}
              data-index={i}
              className="relative aspect-[4/3] w-full shrink-0 snap-center"
              aria-roledescription="スライド"
              aria-label={`${i + 1} / ${media.length}`}
            >
              {m.kind === "photo" ? (
                <button
                  type="button"
                  onClick={() => openLightbox(m.photoIndex)}
                  aria-label={`${m.photoIndex + 1}枚目の写真を拡大して見る`}
                  className="group absolute inset-0 cursor-zoom-in"
                >
                  <Image
                    src={m.image.url}
                    alt={`${alt}（${m.photoIndex + 1}枚目）`}
                    fill
                    sizes="(min-width: 768px) 640px, 100vw"
                    priority={i === 0}
                    className="object-contain object-center"
                    draggable={false}
                  />
                </button>
              ) : (
                <video
                  src={m.url}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`${alt}の動画`}
                  className="absolute inset-0 h-full w-full bg-black object-contain"
                />
              )}
            </div>
          ))}
        </div>

        {status && <StatusBadge status={status} />}

        {/* 何枚目か。写真が複数あることに気づいてもらう */}
        {media.length > 1 && (
          <span className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/55 px-2.5 py-[3px] text-[12px] tabular-nums text-white">
            {active + 1} / {media.length}
          </span>
        )}
        {current.kind === "photo" && (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/55 px-2.5 py-[3px] font-jp text-[11px] text-white">
            タップで拡大
          </span>
        )}

        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              disabled={active === 0}
              aria-label="前の写真"
              className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[20px] text-ink shadow transition-opacity hover:bg-white disabled:opacity-0 md:flex"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              disabled={active === media.length - 1}
              aria-label="次の写真"
              className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[20px] text-ink shadow transition-opacity hover:bg-white disabled:opacity-0 md:flex"
            >
              ›
            </button>
          </>
        )}
      </div>

      {media.length > 1 && (
        <ul
          ref={thumbsRef}
          className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {media.map((m, i) => (
            <li key={m.kind === "photo" ? `t-${m.image.url}-${i}` : "t-video"} className="w-[22%] shrink-0 sm:w-[18%]">
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={m.kind === "photo" ? `${m.photoIndex + 1}枚目の写真を表示` : "動画を表示"}
                aria-current={i === active}
                className={`relative block aspect-[4/3] w-full overflow-hidden rounded-[6px] bg-beige transition-all ${
                  i === active ? "ring-2 ring-pink" : "opacity-70 hover:opacity-100 hover:ring-1 hover:ring-pink"
                }`}
              >
                {m.kind === "photo" ? (
                  <Image
                    src={m.image.url}
                    alt=""
                    fill
                    sizes="160px"
                    className="object-cover object-center"
                    draggable={false}
                  />
                ) : (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-ink/80 text-white">
                    <span aria-hidden className="text-[18px] leading-none">{"\u25B6\uFE0E"}</span>
                    <span className="font-jp text-[10px]">動画</span>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {lightboxAt !== null && images.length > 0 && (
        <Lightbox
          images={images}
          alt={alt}
          startIndex={lightboxAt}
          onClose={closeLightbox}
          onIndexChange={(i) => (lastViewed.current = i)}
        />
      )}
    </div>
  );
};

export default PhotoGallery;
