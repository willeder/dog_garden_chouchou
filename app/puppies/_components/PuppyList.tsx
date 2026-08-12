"use client";

import { useEffect, useMemo, useState } from "react";
import type { Puppy } from "@/app/_model/puppy";
import BreedFilter from "./BreedFilter";
import PuppyCard from "./PuppyCard";
import Pagination from "./Pagination";

/** 1ページあたりの表示件数 */
const PER_PAGE = 12;

/** 犬種チップで絞り込み、12件ずつページ送りする仔犬一覧 */
export const PuppyList = ({ puppies }: { puppies: Puppy[] }) => {
  const [selectedBreed, setSelectedBreed] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(
    () =>
      selectedBreed === null
        ? puppies
        : puppies.filter((puppy) => puppy.breed === selectedBreed),
    [puppies, selectedBreed]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  // 絞り込みを変えたら1ページ目に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBreed]);

  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <>
      <BreedFilter selected={selectedBreed} onSelect={setSelectedBreed} />

      {filtered.length === 0 ? (
        <p className="py-12 text-center font-jp text-[14px] leading-[1.6] text-ink-light md:text-[16px]">
          現在ご紹介できる仔犬はいません。次のご縁をお待ちください。
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
