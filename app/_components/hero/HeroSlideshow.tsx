"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { heroSlides } from "./data";
import { heroCopy } from "./copy";

/** 自動送りの間隔（ミリ秒）。dog_breeder_ran と同じ5秒 */
const INTERVAL = 5000;

/**
 * キービジュアル。
 * 構成は dog_breeder_ran のヒーロー（全幅スライドショー＋キャッチコピー＋インジケータ）、
 * 見た目は Figma のトンマナ（下端に緑の丘・雲・花を重ねて次のセクションと地続きにする）。
 */
export const HeroSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const total = heroSlides.length;

  const move = useCallback((index: number) => setCurrent(index), []);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), INTERVAL);
    return () => clearInterval(id);
  }, [total]);

  return (
    // 高さ固定ではなくアスペクト比指定にして、画面幅が変わっても写真の見え方を揃える。
    // SPはスマホで横向きに撮った写真と同じ4:3、sm以上は横画面と同じ16:9。
    // 大画面で高くなりすぎないよう max-h でクランプする（その分だけ上下がトリミングされる）。
    <section
      className="relative aspect-[4/3] max-h-[72vh] w-full overflow-hidden bg-blue sm:aspect-[16/9]"
      aria-label="キービジュアル"
    >
      {/* 写真（フェードで切り替え） */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.src}
          aria-hidden={index !== current}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={index === current ? slide.alt : ""}
            fill
            priority={index === 0}
            sizes="100vw"
            // 縦長写真を横長に切り抜くため、顔が入りやすい上寄り中央を基準にする
            className="object-cover object-[center_35%]"
          />
        </div>
      ))}

      {/* 文字の可読性を確保する淡いグラデーション（白ベースでトンマナを崩さない） */}
      {/* SPは縦方向、PCは横方向にかける */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/65 to-white/25 md:hidden"
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-gradient-to-r from-white/90 via-white/40 to-transparent md:block"
      />

      {/* キャッチコピー */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1024px] flex-col items-start justify-center px-6 pb-[14%] md:px-10 md:pb-[10%]">
        {/* ページ唯一のh1。デザインを壊さないよう小さめに置く */}
        <h1 className="mb-2 font-jp text-[11px] font-extrabold leading-[1.6] tracking-[0.06em] text-ink drop-shadow-[0_1px_3px_rgba(255,255,255,1)] md:text-[14px]">
          {heroCopy.h1}
        </h1>
        <p className="whitespace-pre-line font-jp text-[22px] font-extrabold leading-[1.5] text-ink drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] md:text-[36px]">
          {heroCopy.main}
        </p>
        <p className="mt-3 max-w-[300px] font-jp text-[13px] font-extrabold leading-[1.6] text-ink drop-shadow-[0_1px_3px_rgba(255,255,255,1)] md:max-w-[420px] md:text-[16px]">
          {heroCopy.sub}
        </p>
      </div>

      {/* 雲 */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        <Image
          src="/assets/cloud-white.svg"
          alt=""
          width={120}
          height={62}
          className="absolute left-[6%] top-[10%]"
        />
        <Image
          src="/assets/cloud-white.svg"
          alt=""
          width={120}
          height={62}
          className="absolute left-[80%] top-[16%] -scale-x-100"
        />
      </div>

      {/* 緑の丘（写真の手前に重ね、次のABOUT USセクションと地続きにする） */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[24%] md:h-[28%]" aria-hidden>
        <Image src="/assets/footer-wave.svg" alt="" fill className="object-fill" />
        <Image
          src="/assets/flower-pink.svg"
          alt=""
          width={28}
          height={41}
          className="absolute left-[12%] top-[40%]"
        />
        <Image
          src="/assets/flower-purple.svg"
          alt=""
          width={32}
          height={46}
          className="absolute left-[22%] top-[55%]"
        />
        <Image
          src="/assets/flower-purple.svg"
          alt=""
          width={32}
          height={46}
          className="absolute left-[76%] top-[44%] -scale-x-100"
        />
        <Image
          src="/assets/flower-pink.svg"
          alt=""
          width={28}
          height={41}
          className="absolute left-[87%] top-[58%] -scale-x-100"
        />
      </div>

      {/* スライドインジケータ */}
      <div className="absolute inset-x-0 bottom-[4%] z-10 flex justify-center gap-2">
        {heroSlides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => move(index)}
            aria-label={`${index + 1}枚目の写真を表示`}
            aria-current={index === current}
            className={`h-[8px] cursor-pointer rounded-full transition-all ${
              index === current ? "w-[24px] bg-pink" : "w-[8px] bg-white/80 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlideshow;
