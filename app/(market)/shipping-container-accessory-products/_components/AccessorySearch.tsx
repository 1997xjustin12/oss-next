"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchBox } from "react-instantsearch";
import { Search } from "lucide-react";

/**
 * Product search. Searches as you type after a short pause, and on Enter or the
 * button straight away.
 */
export function AccessorySearch() {
  // Debounced: one request per pause in typing, not per keystroke.
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const queryHook = useCallback((q: string, search: (value: string) => void) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(q), 300);
  }, []);
  const { query, refine } = useSearchBox({ queryHook });
  const [value, setValue] = useState(query);

  // Follow a query set from outside the box (back/forward, a shared URL).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors external state into the input
    setValue((current) => (current.trim() === query ? current : query));
  }, [query]);

  return (
    <form
      role="search"
      className="flex w-full sm:max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        refine(value.trim());
      }}
    >
      <label htmlFor="accessory-search" className="sr-only">
        Search accessories
      </label>
      <input
        id="accessory-search"
        type="search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          refine(e.target.value.trim());
        }}
        placeholder="Search products…"
        maxLength={80}
        autoComplete="off"
        className="min-h-11 w-full min-w-0 rounded-l-md border border-r-0 border-theme-border bg-white px-3 text-sm text-theme-dark placeholder:text-theme-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100 dark:placeholder:text-gray-400"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-r-md bg-theme-primary text-white transition-colors hover:bg-theme-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
      >
        <Search aria-hidden className="h-4 w-4" />
      </button>
    </form>
  );
}
