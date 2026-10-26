"use client";

import { useNumericMenu, useRefinementList } from "react-instantsearch";
import type { UseRefinementListProps } from "react-instantsearch";
import {
  ACCESSORY_FILTER_CATEGORIES,
  ACCESSORY_PRICE_RANGES,
  CATEGORY_ATTRIBUTE,
  PRICE_ATTRIBUTE,
  STOCK_ATTRIBUTE,
} from "@/lib/accessoryCatalog";

type Props = {
  /** The panel renders twice (phone and desktop); this keeps input ids unique. */
  idPrefix: string;
};

const OPTION =
  "flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-1.5 text-sm text-theme-dark-2 transition-colors hover:bg-theme-subtle has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-theme-primary dark:text-gray-300 dark:hover:bg-neutral-800";
const INPUT = "h-4 w-4 shrink-0 accent-theme-primary dark:accent-red-400";

// The inputs are uncontrolled and keyed on the refinement: a click ticks the
// box at once, and when the search answers the input remounts in step with the
// real state. Controlled inputs would wait for the response before showing the
// tick, so a click looked ignored on a slow connection.

// Widget options are module constants on purpose: InstantSearch re-registers a
// widget whose options change identity, and a new array or function on every
// render loops forever (React error #301).

/**
 * Only the page's categories, in its order; one with no products still shows,
 * with (0), so the list does not jump around as filters change.
 */
const orderCategories: NonNullable<UseRefinementListProps["transformItems"]> = (found) =>
  ACCESSORY_FILTER_CATEGORIES.map(
    (name) =>
      found.find((item) => item.value === name) ?? {
        value: name,
        label: name,
        highlighted: name,
        count: 0,
        isRefined: false,
      },
  );

const PRICE_ITEMS = [{ label: "All" }, ...ACCESSORY_PRICE_RANGES.map(({ label, start, end }) => ({ label, start, end }))];

const STOCK_ITEMS = [{ label: "Show all" }, { label: "In stock", start: 1 }];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-5 first:mt-4">
      <legend className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-theme-muted dark:text-gray-400">
        {title}
      </legend>
      <ul className="space-y-0.5">{children}</ul>
    </fieldset>
  );
}

/** Category, in the page's fixed order, with how many products each has. */
function CategoryFilter({ idPrefix }: Props) {
  const { items, refine } = useRefinementList({
    attribute: CATEGORY_ATTRIBUTE,
    operator: "or",
    limit: 50,
    transformItems: orderCategories,
  });

  return (
    <Group title="Category">
      {items.map((item) => {
        const id = `${idPrefix}-cat-${item.value}`;
        return (
          <li key={item.value}>
            <label htmlFor={id} className={OPTION}>
              <input key={String(item.isRefined)} id={id} type="checkbox" className={INPUT} defaultChecked={item.isRefined} onChange={() => refine(item.value)} />
              <span className="flex-1">{item.label}</span>
              <span className="text-theme-muted dark:text-gray-400">({item.count})</span>
            </label>
          </li>
        );
      })}
    </Group>
  );
}

/** Price range: one at a time; ticking the active range again clears it. */
function PriceFilter({ idPrefix }: Props) {
  const { items, refine } = useNumericMenu({
    attribute: PRICE_ATTRIBUTE,
    items: PRICE_ITEMS,
  });
  const all = items[0];

  return (
    <Group title="Price range">
      {items.slice(1).map((item) => {
        const id = `${idPrefix}-price-${item.label}`;
        return (
          <li key={item.value}>
            <label htmlFor={id} className={OPTION}>
              <input
                key={String(item.isRefined)}
                id={id}
                type="checkbox"
                className={INPUT}
                defaultChecked={item.isRefined}
                onChange={() => refine(item.isRefined ? all.value : item.value)}
              />
              <span className="flex-1">{item.label}</span>
            </label>
          </li>
        );
      })}
    </Group>
  );
}

/** Availability: in stock means variants[0].qty of at least 1. */
function AvailabilityFilter({ idPrefix }: Props) {
  const { items, refine } = useNumericMenu({
    attribute: STOCK_ATTRIBUTE,
    items: STOCK_ITEMS,
  });
  // The page's order: In stock, then Show all.
  const ordered = [items[1], items[0]].filter(Boolean);

  return (
    <Group title="Availability">
      {ordered.map((item) => {
        const id = `${idPrefix}-stock-${item.label}`;
        return (
          <li key={item.value}>
            <label htmlFor={id} className={OPTION}>
              <input
                key={String(item.isRefined)}
                id={id}
                type="radio"
                name={`${idPrefix}-availability`}
                className={INPUT}
                defaultChecked={item.isRefined}
                onChange={() => refine(item.value)}
              />
              <span className="flex-1">{item.label}</span>
            </label>
          </li>
        );
      })}
    </Group>
  );
}

/** The filter panel: category, price range and availability. */
export function AccessoryFilters({ idPrefix }: Props) {
  return (
    <>
      <CategoryFilter idPrefix={idPrefix} />
      <PriceFilter idPrefix={idPrefix} />
      <AvailabilityFilter idPrefix={idPrefix} />
    </>
  );
}
