"use client";

import { useEffect } from "react";
import type { Puppy } from "@/app/_model/puppy";
import { trackPuppyView } from "@/app/_lib/analytics";

/**
 * 仔犬詳細の閲覧をGA4に送る。
 * 犬種・性別・ステータス別の閲覧数が取れるので、どの犬種に需要があるかが分かる。
 */
export const PuppyViewTracker = ({ puppy }: { puppy: Puppy }) => {
  useEffect(() => {
    trackPuppyView({
      puppy_id: puppy.id,
      breed: puppy.breed,
      sex: puppy.sex,
      status: puppy.status ?? "募集中",
      // 成約済みは価格を非表示にしているため、計測にも価格を送らない
      price: puppy.status === "成約済み" ? undefined : puppy.price,
    });
  }, [puppy]);

  return null;
};

export default PuppyViewTracker;
