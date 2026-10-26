import { Layers, Lightbulb, Shield, Truck, Wrench } from "lucide-react";
import { accessoryCategoryHref } from "@/lib/accessoryCatalog";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";

/**
 * The five categories the WordPress page led with, in its order. `category`
 * is the Elasticsearch category name the tile filters to.
 */
const TILES = [
  { label: "Security", category: "Security", Icon: Shield },
  { label: "Lighting", category: "Lighting", Icon: Lightbulb },
  { label: "Shelving", category: "Shelving", Icon: Layers },
  { label: "Ramps", category: "Ramp", Icon: Truck },
  { label: "Parts", category: "Parts", Icon: Wrench },
] as const;

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
          {TILES.map(({ label, category, Icon }) => (
            <li key={category}>
              <Link
                href={accessoryCategoryHref(category)}
                className="group flex h-full flex-col items-center justify-center gap-3 rounded-lg border border-theme-border bg-white px-4 py-6 text-center transition-colors hover:border-theme-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-red-400"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-theme-primary-light text-theme-primary dark:bg-red-950 dark:text-red-400">
                  <Icon aria-hidden className="h-7 w-7" />
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-theme-dark dark:text-gray-100">
                  {label}
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
