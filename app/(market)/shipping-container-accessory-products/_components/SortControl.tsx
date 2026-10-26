"use client";

import Form from "next/form";
import { ROUTES } from "@/config/routes";
import { ACCESSORY_SORTS } from "@/lib/accessoryCatalog";
import type { AccessorySortKey } from "@/types/accessoryCatalog";

type Props = {
  value: AccessorySortKey;
  /** The other active filters, kept across a sort change. */
  hidden: Record<string, string>;
};

/**
 * Sort order. A client component only so a change applies straight away;
 * without JavaScript the Apply button submits the same GET form.
 */
export function SortControl({ value, hidden }: Props) {
  return (
    <Form action={ROUTES.ACCESSORY_PRODUCTS} scroll={false} className="flex items-center gap-2">
      {Object.entries(hidden).map(([name, v]) => (
        <input key={name} type="hidden" name={name} value={v} />
      ))}
      <label htmlFor="accessory-sort" className="shrink-0 text-sm font-semibold text-theme-dark dark:text-gray-200">
        Sort by
      </label>
      <select
        // Re-mount on a new value so the select shows the order the URL asks for.
        key={value}
        id="accessory-sort"
        name="sort"
        defaultValue={value}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="min-h-11 rounded-md border border-theme-border bg-white px-3 text-sm text-theme-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
      >
        {ACCESSORY_SORTS.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="min-h-11 rounded-md border border-theme-border px-3 text-sm font-semibold">
          Apply
        </button>
      </noscript>
    </Form>
  );
}
