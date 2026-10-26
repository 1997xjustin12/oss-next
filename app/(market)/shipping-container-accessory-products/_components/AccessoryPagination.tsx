"use client";

import { usePagination } from "react-instantsearch";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ACCESSORY_RESULTS_ID } from "@/lib/accessoryCatalog";

const BOX =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary disabled:cursor-not-allowed disabled:opacity-50";
const IDLE =
  "border-theme-border bg-white text-theme-dark hover:border-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100";
const CURRENT = "border-theme-primary bg-theme-primary text-white";

/** Page buttons. Nothing renders when everything fits on one page. */
export function AccessoryPagination() {
  const { pages, currentRefinement, nbPages, isFirstPage, isLastPage, refine } = usePagination({ padding: 2 });
  if (nbPages <= 1) return null;

  // A new page starts at the top of the results, not where the old one was scrolled to.
  const go = (page: number) => {
    refine(page);
    document.getElementById(ACCESSORY_RESULTS_ID)?.scrollIntoView({ block: "start" });
  };

  return (
    <nav aria-label="Pagination" className="mt-8">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          <button type="button" className={`${BOX} ${IDLE}`} disabled={isFirstPage} onClick={() => go(currentRefinement - 1)} aria-label="Previous page">
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </button>
        </li>
        {pages.map((page) => (
          <li key={page}>
            <button
              type="button"
              className={`${BOX} ${page === currentRefinement ? CURRENT : IDLE}`}
              onClick={() => go(page)}
              aria-label={`Page ${page + 1}`}
              aria-current={page === currentRefinement ? "page" : undefined}
            >
              {page + 1}
            </button>
          </li>
        ))}
        <li>
          <button type="button" className={`${BOX} ${IDLE}`} disabled={isLastPage} onClick={() => go(currentRefinement + 1)} aria-label="Next page">
            <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
