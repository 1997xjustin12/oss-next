"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Configure, InstantSearch, useInstantSearch } from "react-instantsearch";
import { SlidersHorizontal } from "lucide-react";
import { ROUTES } from "@/config/routes";
import {
  ACCESSORY_HITS_PER_PAGE,
  ACCESSORY_INDEX,
  paramsFromUiState,
  sortParamForIndex,
  uiStateFromParams,
} from "@/lib/accessoryCatalog";
import { createSearchClient } from "@/lib/instantSearchClient";
import { AccessoryFilters } from "./AccessoryFilters";
import { AccessoryHits } from "./AccessoryHits";
import { AccessoryPagination } from "./AccessoryPagination";
import { AccessorySearch } from "./AccessorySearch";
import { SortControl } from "./SortControl";

/**
 * Keeps InstantSearch and the URL in step.
 *
 * Outbound: every state change is written with history.replaceState (see
 * onStateChange below), which Next.js syncs with its router, so a filtered view
 * has a shareable URL without a server round trip.
 *
 * Inbound: a change the page did not write itself — a category tile, back /
 * forward — is applied to InstantSearch here. The last URL written is
 * remembered so the page's own writes are not applied twice.
 */
function UrlSync({ lastWrittenRef }: { lastWrittenRef: React.RefObject<string> }) {
  const searchParams = useSearchParams();
  const { setIndexUiState } = useInstantSearch();
  const search = searchParams.toString();

  useEffect(() => {
    const current = search ? `?${search}` : "";
    if (current === lastWrittenRef.current) return;
    lastWrittenRef.current = current;
    setIndexUiState(uiStateFromParams(searchParams));
  }, [search, searchParams, setIndexUiState, lastWrittenRef]);

  return null;
}

/**
 * The search, filters, sort, product grid and pagination: InstantSearch over
 * POST /api/search, with productType "accessories". The only client part of
 * the page; everything around it is server-rendered.
 */
export function AccessoryInstantSearch() {
  const searchParams = useSearchParams();
  const [searchFailed, setSearchFailed] = useState(false);
  const searchClient = useMemo(
    () =>
      createSearchClient({
        extraParams: (request) => ({ productType: "accessories", sortParam: sortParamForIndex(request.indexName) }),
        onError: setSearchFailed,
      }),
    [],
  );

  // The URL at mount seeds the state; later URL changes go through UrlSync.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only, by design
  const initialUiState = useMemo(() => ({ [ACCESSORY_INDEX]: uiStateFromParams(searchParams) }), []);
  const lastWrittenRef = useRef(searchParams.toString() ? `?${searchParams.toString()}` : "");

  // instantsearch.js does not restart its search instance when Next.js
  // reconnects this subtree from the back/forward cache, leaving the widgets
  // empty. A fresh key on any mount after the first remounts it cleanly — the
  // same fix as the listing page (sale-shipping-containers/InstantSearchSection).
  const [instanceKey, setInstanceKey] = useState(0);
  const hasMounted = useRef(false);
  useEffect(() => {
    if (hasMounted.current) setInstanceKey((k) => k + 1);
    hasMounted.current = true;
  }, []);

  return (
    <InstantSearch
      key={instanceKey}
      searchClient={searchClient}
      indexName={ACCESSORY_INDEX}
      initialUiState={initialUiState}
      future={{ preserveSharedStateOnUnmount: true }}
      onStateChange={({ uiState, setUiState }) => {
        setUiState(uiState);
        const next = paramsFromUiState(uiState[ACCESSORY_INDEX] ?? {});
        if (next === lastWrittenRef.current) return;
        lastWrittenRef.current = next;
        window.history.replaceState(null, "", `${ROUTES.ACCESSORY_PRODUCTS}${next}`);
      }}
    >
      <Configure hitsPerPage={ACCESSORY_HITS_PER_PAGE} />
      <UrlSync lastWrittenRef={lastWrittenRef} />

      <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
        {/* Phones and tablets: filters collapse behind a toggle. */}
        <details className="mb-6 rounded-lg border border-theme-border bg-white lg:hidden dark:border-neutral-800 dark:bg-neutral-900">
          <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-4 font-bold text-theme-dark dark:text-gray-100">
            <SlidersHorizontal aria-hidden className="h-4 w-4" />
            Filters
          </summary>
          <div className="border-t border-theme-border px-4 pb-4 dark:border-neutral-800">
            <AccessoryFilters idPrefix="m" />
          </div>
        </details>

        <aside aria-label="Filters" className="hidden lg:block">
          <AccessoryFilters idPrefix="d" />
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AccessorySearch />
            <SortControl />
          </div>

          {searchFailed && (
            <p role="alert" className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
              Products could not be loaded just now. Please try again in a moment, or call us.
            </p>
          )}

          <AccessoryHits />
          <AccessoryPagination />
        </div>
      </div>
    </InstantSearch>
  );
}
