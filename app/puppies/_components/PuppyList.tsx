"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Puppy } from "@/app/_model/puppy";
import { breeds } from "@/app/_model/breed";
import BreedFilter from "./BreedFilter";
import PuppyCard from "./PuppyCard";
import Pagination from "./Pagination";

/** 1ページあたりの表示件数 */
const PER_PAGE = 12;

/**
 * 犬種チップで絞り込み、12件ずつページ送りする仔犬一覧。
 * 絞り込みはURLの ?breed= と同期するため、TOPの犬種カードから直接絞り込んだ状態で開ける。
 */
export const PuppyList = ({ puppies }: { puppies: Puppy[] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLの ?breed= を初期値にする（不正な値は無視）
  const breedParam = searchParams.get("breed");
  const initialBreed =
    breedParam && (breeds as readonly string[]).includes(breedParam) ? breedParam : null;

  const [selectedBreed, setSelectedBreed] = useState<string | null>(initialBreed);
  const [currentPage, setCurrentPage] = useState(1);

  // ブラウザの戻る/進むでURLが変わったときも追従させる
  useEffect(() => {
    setSelectedBreed(initialBreed);
    setCurrentPage(1);
  }, [initialBreed]);

  const handleSelect = useCallback(
    (breed: string | null) => {
      setSelectedBreed(breed);
      setCurrentPage(1);
      const params = new URLSearchParams(searchParams.toString());
      if (breed === null) {
        params.delete("breed");
      } else {
        params.set("breed", breed);
      }
      const query = params.toString();
      router.replace(query ? `/puppies?${query}` : "/puppies", { scroll: false });
    },
    [router, searchParams]
  );

  const filtered = useMemo(
    () =>
      selectedBreed === null
        ? puppies
        : puppies.filter((puppy) => puppy.breed === selectedBreed),
    [puppies, selectedBreed]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <>
      <BreedFilter selected={selectedBreed} onSelect={handleSelect} />

      {filtered.length === 0 ? (
        <p className="py-12 text-center font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
          {selectedBreed
            ? `現在、${selectedBreed}の仔犬のご紹介はありません。次のご縁をお待ちください。`
            : "現在ご紹介できる仔犬はいません。次のご縁をお待ちください。"}
        </p>
      ) : (
        <>
          <ul className="grid w-full grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((puppy) => (
              <PuppyCard key={puppy.id} puppy={puppy} />
            ))}
          </ul>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        </>
      )}
    </>
  );
};

export default PuppyList;
