"use client";

import { useSortBy } from "react-instantsearch";
import { ACCESSORY_SORTS } from "@/lib/accessoryCatalog";

// A module constant: InstantSearch re-registers a widget whose options change identity.
const SORT_ITEMS = ACCESSORY_SORTS.map((s) => ({ label: s.label, value: s.index }));

/** Sort order. Each order is its own InstantSearch "index"; the server maps it back. */
export function SortControl() {
  const { currentRefinement, options, refine } = useSortBy({ items: SORT_ITEMS });

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="accessory-sort" className="shrink-0 text-sm font-semibold text-theme-dark dark:text-gray-200">
        Sort by
      </label>
      <select
        id="accessory-sort"
        value={currentRefinement}
        onChange={(e) => refine(e.target.value)}
        className="min-h-11 rounded-md border border-theme-border bg-white px-3 text-sm text-theme-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
