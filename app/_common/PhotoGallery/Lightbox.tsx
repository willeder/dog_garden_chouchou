"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ImageWithSize } from "@/app/_model/image";

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

/**
 * 写真の全画面表示。
 *  - 左右スワイプ／矢印キー／ボタンで前後の写真へ
 *  - ピンチ・ダブルタップ（PCはダブルクリック）で拡大、拡大中はドラッグで移動
 *  - Esc・×・背景タップ・スマホの「戻る」で閉じる（戻るでページごと離れないようにする）
 *
 * 購入を考えている方は、毛色・顔つき・体つきを細かく見たい。
 * 小さな枠の写真だけでは判断できず、問い合わせ前に離脱する原因になる。
 */
export function Lightbox({
  images,
  alt,
  startIndex,
  onClose,
  onIndexChange,
}: {
  images: ImageWithSize[];
  alt: string;
  startIndex: number;
  onClose: () => void;
  onIndexChange?: (i: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // 開いた写真の位置から始める（アニメーションなし）
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = startIndex * el.clientWidth;
  }, [startIndex]);

  const goTo = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el) return;
      const next = Math.max(0, Math.min(images.length - 1, i));
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    },
    [images.length],
  );

  // 背景のスクロールを止め、閉じたら元のフォーカスに戻す
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const t = window.setTimeout(() => setShowHint(false), 2500);
    return () => {
      document.body.style.overflow = prevOverflow;
      // preventScroll: 元のボタンへフォーカスを戻すとき、カルーセルが1枚目に戻らないように
      prevFocus?.focus?.({ preventScroll: true });
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && !zoomed) goTo(index + 1);
      else if (e.key === "ArrowLeft" && !zoomed) goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, zoomed, goTo, onClose]);

  // 画面の回転・リサイズで位置がずれないようにする
  useEffect(() => {
    const onResize = () => {
      const el = trackRef.current;
      if (el) el.scrollLeft = index * el.clientWidth;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [index]);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) {
      setIndex(i);
      setZoomed(false);
      onIndexChange?.(i);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt}の写真（拡大表示）`}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-3">
        <span className="text-[14px] tabular-nums" aria-live="polite">
          {index + 1} / {images.length}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="flex h-11 w-11 items-center justify-center rounded-full text-[28px] leading-none hover:bg-white/10"
        >
          ×
        </button>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className={`flex min-h-0 flex-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          zoomed ? "overflow-hidden" : "overflow-x-auto"
        }`}
      >
        {images.map((img, i) => (
          <div key={`${img.url}-${i}`} className="relative h-full w-full shrink-0 snap-center">
            <ZoomableImage
              image={img}
              alt={`${alt}（${i + 1}枚目）`}
              active={i === index}
              onZoomChange={setZoomed}
              onBackgroundTap={onClose}
              eager={Math.abs(i - startIndex) <= 1}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0 || zoomed}
            aria-label="前の写真"
            className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-[24px] hover:bg-white/25 disabled:opacity-0 md:flex"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === images.length - 1 || zoomed}
            aria-label="次の写真"
            className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-[24px] hover:bg-white/25 disabled:opacity-0 md:flex"
          >
            ›
          </button>
        </>
      )}

      <p
        className={`pointer-events-none absolute inset-x-0 bottom-6 text-center font-jp text-[12px] text-white/80 transition-opacity duration-500 ${
          showHint && !zoomed ? "opacity-100" : "opacity-0"
        }`}
      >
        ピンチ・ダブルタップで拡大できます
      </p>
    </div>,
    document.body,
  );
}

type Pt = { x: number; y: number };

/**
 * 拡大できる写真1枚。
 * ライブラリを足さず pointer events で実装している（依存を増やさない）。
 */
function ZoomableImage({
  image,
  alt,
  active,
  onZoomChange,
  onBackgroundTap,
  eager,
}: {
  image: ImageWithSize;
  alt: string;
  active: boolean;
  onZoomChange: (zoomed: boolean) => void;
  onBackgroundTap: () => void;
  eager: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<{
    startScale: number;
    startDist: number;
    startTx: number;
    startTy: number;
    start: Pt;
    moved: boolean;
  } | null>(null);
  const lastTap = useRef(0);

  // 別の写真に移ったら拡大を戻す
  useEffect(() => {
    if (!active) {
      setScale(1);
      setTx(0);
      setTy(0);
    }
  }, [active]);

  useEffect(() => {
    if (active) onZoomChange(scale > 1.01);
  }, [scale, active, onZoomChange]);

  /** 拡大しても写真が枠の外に逃げないよう移動量を抑える */
  const clamp = (s: number, x: number, y: number) => {
    const box = boxRef.current;
    if (!box) return { x, y };
    const maxX = ((s - 1) * box.clientWidth) / 2;
    const maxY = ((s - 1) * box.clientHeight) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  };

  /** 指定した点を中心に倍率を変える */
  const zoomAt = (next: number, at: Pt) => {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const cx = at.x - r.left - r.width / 2;
    const cy = at.y - r.top - r.height / 2;
    const s = Math.max(1, Math.min(MAX_SCALE, next));
    const nx = cx - ((cx - tx) * s) / scale;
    const ny = cy - ((cy - ty) * s) / scale;
    const c = clamp(s, nx, ny);
    setScale(s);
    setTx(s === 1 ? 0 : c.x);
    setTy(s === 1 ? 0 : c.y);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try {
      // 指が写真の外に出てもドラッグを続けられるようにする。対応していない環境では無視
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } catch {
      /* noop */
    }
    const pts = [...pointers.current.values()];
    gesture.current = {
      startScale: scale,
      startDist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      startTx: tx,
      startTy: ty,
      start: { x: e.clientX, y: e.clientY },
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];

    if (pts.length === 2 && g.startDist > 0) {
      // ピンチ
      g.moved = true;
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      zoomAt(g.startScale * (dist / g.startDist), mid);
      return;
    }
    if (pts.length === 1 && scale > 1) {
      // 拡大中のドラッグで移動
      const dx = e.clientX - g.start.x;
      const dy = e.clientY - g.start.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) g.moved = true;
      const c = clamp(scale, g.startTx + dx, g.startTy + dy);
      setTx(c.x);
      setTy(c.y);
      return;
    }
    if (Math.abs(e.clientX - g.start.x) + Math.abs(e.clientY - g.start.y) > 8) g.moved = true;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size > 0) {
      // ピンチの片方の指が離れた。残った指でドラッグを続けられるよう起点を取り直す
      const [p] = [...pointers.current.values()];
      gesture.current = { startScale: scale, startDist: 0, startTx: tx, startTy: ty, start: p, moved: true };
      return;
    }
    gesture.current = null;
    if (!g || g.moved) return;

    // ここからはタップ
    const now = Date.now();
    if (now - lastTap.current < 300) {
      lastTap.current = 0;
      zoomAt(scale > 1.01 ? 1 : DOUBLE_TAP_SCALE, { x: e.clientX, y: e.clientY });
    } else {
      lastTap.current = now;
    }
  };

  const onPointerCancel = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) gesture.current = null;
  };

  // 写真の外（黒い余白）を1回タップしたら閉じる。写真の上のタップは拡大操作に使う
  const onBoxClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && scale <= 1.01) onBackgroundTap();
  };

  // 表示される写真の実際の大きさ（余白を除く）
  const ratio = image.width / image.height;

  return (
    <div
      ref={boxRef}
      onClick={onBoxClick}
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={{ touchAction: scale > 1.01 ? "none" : "pan-x" }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onDoubleClick={(e) => e.preventDefault()}
        className={`relative max-h-full max-w-full select-none ${scale > 1.01 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
        style={{
          aspectRatio: `${ratio}`,
          width: `min(100%, calc((100dvh - 3.5rem) * ${ratio}))`,
          transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
          transition: gesture.current ? "none" : "transform 150ms ease-out",
        }}
      >
        <Image
          src={image.url}
          alt={alt}
          fill
          sizes="100vw"
          loading={eager ? "eager" : "lazy"}
          className="pointer-events-none object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
}

export default Lightbox;
