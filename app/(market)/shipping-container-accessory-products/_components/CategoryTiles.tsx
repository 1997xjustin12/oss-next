import { accessoryHref, parseAccessoryQuery, withQuery } from "@/lib/accessoryCatalog";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import { CategoryIcon } from "./CategoryIcon";
import type { AccessoryCategoryKey } from "@/types/accessoryCatalog";

/** The five categories the WordPress page led with, in its order. */
const TILES: { key: AccessoryCategoryKey; label: string }[] = [
  { key: "security", label: "Security" },
  { key: "lighting", label: "Lighting" },
  { key: "shelving", label: "Shelving" },
  { key: "ramps", label: "Ramps" },
  { key: "parts", label: "Parts" },
];

const BASE_QUERY = parseAccessoryQuery({});

/** Shop by category: each tile opens the product list filtered to it. */
export function CategoryTiles() {
  return (
    <section aria-labelledby="categories-heading" className="bg-white px-4 py-12 sm:px-[5%] dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl">
        <h2
          id="categories-heading"
          className="mb-6 text-2xl font-extrabold text-theme-dark sm:text-3xl dark:text-gray-100"
        >
          Shop by category
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {TILES.map((tile) => (
            <li key={tile.key}>
              <Link
                href={accessoryHref(withQuery(BASE_QUERY, { categories: [tile.key] }))}
                className="group flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-theme-border bg-white px-4 py-6 text-center transition-colors hover:border-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-red-400"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary dark:bg-red-950 dark:text-red-400">
                  <CategoryIcon category={tile.key} className="h-7 w-7" />
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-theme-dark dark:text-gray-100">
                  {tile.label}
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
