import { SlidersHorizontal } from "lucide-react";
import { getAccessoryCatalog } from "@/services/accessoryCatalog.service";
import {
  ACCESSORY_PAGE_SIZE,
  accessoryHiddenFields,
  accessoryHref,
  applyAccessoryQuery,
  hasActiveFilters,
  parseAccessoryQuery,
  withQuery,
} from "@/lib/accessoryCatalog";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import { AccessoryCard } from "./AccessoryCard";
import { AccessoryFilters } from "./AccessoryFilters";
import { AccessoryPagination } from "./AccessoryPagination";
import { AccessorySearch } from "./AccessorySearch";
import { SortControl } from "./SortControl";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Filters, toolbar, product grid and pagination for the current URL. */
export async function AccessoryResults({ searchParams }: Props) {
  const [params, catalog] = await Promise.all([searchParams, getAccessoryCatalog()]);
  const query = parseAccessoryQuery(params);
  const results = applyAccessoryQuery(catalog, query);
  const filtered = hasActiveFilters(query);
  const clearHref = accessoryHref(withQuery(query, { categories: [], price: null, inStockOnly: false, q: "" }));

  const from = results.total ? (results.page - 1) * ACCESSORY_PAGE_SIZE + 1 : 0;
  const to = Math.min(results.page * ACCESSORY_PAGE_SIZE, results.total);

  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
      {/* Phones and tablets: filters collapse behind a toggle. */}
      <details className="mb-6 rounded-lg border border-theme-border bg-white lg:hidden dark:border-neutral-800 dark:bg-neutral-900">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-4 font-bold text-theme-dark dark:text-gray-100">
          <SlidersHorizontal aria-hidden className="h-4 w-4" />
          Filters
        </summary>
        <div className="border-t border-theme-border px-4 pb-4 dark:border-neutral-800">
          <AccessoryFilters query={query} counts={results.counts} />
        </div>
      </details>

      <aside aria-label="Filters" className="hidden lg:block">
        <AccessoryFilters query={query} counts={results.counts} />
      </aside>

      <div className="min-w-0">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AccessorySearch defaultValue={query.q} hidden={accessoryHiddenFields(query, "q")} />
          <SortControl value={query.sort} hidden={accessoryHiddenFields(query, "sort")} />
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-theme-muted dark:text-gray-400">
          <p role="status">
            {results.total
              ? `Showing ${from}–${to} of ${results.total} ${results.total === 1 ? "product" : "products"}`
              : "No products found"}
          </p>
          {filtered && (
            <Link
              href={clearHref}
              scroll={false}
              className="font-semibold text-theme-primary underline underline-offset-2 hover:decoration-2 dark:text-red-400"
            >
              Clear all filters
            </Link>
          )}
        </div>

        {results.items.length ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.items.map((item) => (
              <li key={item.id}>
                <AccessoryCard item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-theme-border bg-white px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
            <p className="font-bold text-theme-dark dark:text-gray-100">No accessories match these filters.</p>
            <p className="mt-1 text-sm text-theme-muted dark:text-gray-400">Try removing a filter or searching for something else.</p>
          </div>
        )}

        <AccessoryPagination query={query} page={results.page} pageCount={results.pageCount} />
      </div>
    </div>
  );
}
