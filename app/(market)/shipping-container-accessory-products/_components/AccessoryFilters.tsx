import { Check } from "lucide-react";
import {
  ACCESSORY_CATEGORIES,
  ACCESSORY_PRICE_RANGES,
  accessoryHref,
  toggleCategory,
  withQuery,
} from "@/lib/accessoryCatalog";
import { HoverPrefetchLink as Link } from "@/components/shared/HoverPrefetchLink";
import type { AccessoryResults } from "@/lib/accessoryCatalog";
import type { AccessoryCatalogQuery } from "@/types/accessoryCatalog";

type Props = {
  query: AccessoryCatalogQuery;
  counts: AccessoryResults["counts"];
};

type OptionProps = { href: string; active: boolean; label: string; count?: number };

/**
 * One filter option: a link to the page with the option toggled. The box is a
 * picture of the state; the link itself carries it (aria-current), so assistive
 * tech hears "current" rather than a checkbox that cannot be checked.
 */
function FilterOption({ href, active, label, count }: OptionProps) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        aria-current={active ? "true" : undefined}
        className="flex min-h-9 items-center gap-2.5 rounded-md px-1.5 text-sm text-theme-dark-2 transition-colors hover:bg-theme-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:text-gray-300 dark:hover:bg-neutral-800"
      >
        <span
          aria-hidden
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
            active
              ? "border-theme-primary bg-theme-primary text-white dark:border-red-400 dark:bg-red-400 dark:text-neutral-950"
              : "border-theme-muted dark:border-gray-500"
          }`}
        >
          {active && <Check className="h-3 w-3" strokeWidth={3} />}
        </span>
        <span className="flex-1">{label}</span>
        {count !== undefined && <span className="text-theme-muted dark:text-gray-400">({count})</span>}
      </Link>
    </li>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-4">
      <h3 className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-theme-muted dark:text-gray-400">{title}</h3>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

/** Category, price and availability filters. Server-rendered links only. */
export function AccessoryFilters({ query, counts }: Props) {
  return (
    <>
      <FilterGroup title="Category">
        {ACCESSORY_CATEGORIES.map((c) => (
          <FilterOption
            key={c.key}
            href={accessoryHref(toggleCategory(query, c.key))}
            active={query.categories.includes(c.key)}
            label={c.label}
            count={counts.category[c.key]}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price range">
        {ACCESSORY_PRICE_RANGES.map((r) => {
          const active = query.price === r.key;
          return (
            <FilterOption
              key={r.key}
              href={accessoryHref(withQuery(query, { price: active ? null : r.key }))}
              active={active}
              label={r.label}
              count={counts.price[r.key]}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup title="Availability">
        <FilterOption
          href={accessoryHref(withQuery(query, { inStockOnly: true }))}
          active={query.inStockOnly}
          label="In stock"
        />
        <FilterOption
          href={accessoryHref(withQuery(query, { inStockOnly: false }))}
          active={!query.inStockOnly}
          label="Show all"
        />
      </FilterGroup>
    </>
  );
}
