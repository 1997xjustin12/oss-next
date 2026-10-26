"use client";

import { useClearRefinements, useHits } from "react-instantsearch";
import type { ShippingContainerHit } from "@/types/product";
import { ACCESSORY_HITS_PER_PAGE, hitToAccessoryCard } from "@/lib/accessoryCatalog";
import { AccessoryCard } from "./AccessoryCard";

// Clears the search text as well as the filters. A module constant, for the
// same reason as the filter options (see AccessoryFilters).
const CLEAR_ALL = { excludedAttributes: [] as string[] };

/** Result count, "Clear all filters", the product grid and the empty state. */
export function AccessoryHits() {
  const { items, results } = useHits();
  const { canRefine, refine: clearAll } = useClearRefinements(CLEAR_ALL);

  // Before the first response, results are a placeholder: hold the grid's space.
  if (!results || results.__isArtificial) {
    return (
      <div aria-hidden>
        <div className="mb-4 h-5 w-48 animate-pulse rounded bg-white dark:bg-neutral-900" />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="h-[22rem] animate-pulse rounded-lg bg-white dark:bg-neutral-900" />
          ))}
        </ul>
      </div>
    );
  }

  const total = results.nbHits;
  const from = total ? results.page * ACCESSORY_HITS_PER_PAGE + 1 : 0;
  const to = Math.min(from + items.length - 1, total);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-theme-muted dark:text-gray-400">
        <p role="status">
          {total ? `Showing ${from}–${to} of ${total} ${total === 1 ? "product" : "products"}` : "No products found"}
        </p>
        {canRefine && (
          <button
            type="button"
            onClick={clearAll}
            className="min-h-6 font-semibold text-theme-primary underline underline-offset-2 hover:decoration-2 dark:text-red-400"
          >
            Clear all filters
          </button>
        )}
      </div>

      {items.length ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((hit) => {
            const card = hitToAccessoryCard(hit);
            return (
              <li key={card.id}>
                <AccessoryCard item={card} hit={hit as unknown as ShippingContainerHit} />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-theme-border bg-white px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="font-bold text-theme-dark dark:text-gray-100">No accessories match these filters.</p>
          <p className="mt-1 text-sm text-theme-muted dark:text-gray-400">Try removing a filter or searching for something else.</p>
        </div>
      )}
    </>
  );
}
