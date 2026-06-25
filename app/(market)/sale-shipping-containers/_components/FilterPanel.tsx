"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ZipLookup } from "./ZipLookup";
import Link from "next/link";

type Props = {
  zipcode?: string;
  location?: string;
  ptype?: string;
};

export function buildFilterHref(
  searchParams: { toString(): string },
  property: string,
  value: string | null,
): string {
  const params = new URLSearchParams(searchParams.toString());
  if (value === null) params.delete(property);
  else params.set(property, value);
  params.delete("page");
  return `?${params.toString()}`;
}

export const SHIPPING_CONTAINER_FILTERS = [
  {
    label: "Size/Length",
    property: "length_width",
    options: [
      { label: "All", value: null },
      { label: "20'", value: "20" },
      { label: "40'", value: "40" },
    ],
  },
  {
    label: "Condition",
    property: "condition",
    options: [
      { label: "All", value: null },
      { label: "New", value: "New" },
      { label: "Refurbished", value: "Refurbished" },
      { label: "Used", value: "Used" },
    ],
  },
  {
    label: "Grade",
    property: "grade",
    options: [
      { label: "All", value: null },
      { label: "AS IS", value: "AS IS" },
      { label: "Cargo Worthy (CW)", value: "Cargo Worthy (CW)" },
      { label: "IICL", value: "IICL" },
      { label: "Wind and Water Tight (WWT)", value: "Wind and Water tight (WWT)" },
    ],
  },
  {
    label: "Height",
    property: "height",
    options: [
      { label: "All", value: null },
      { label: `8' 6" Standard`, value: `8' 6" Standard` },
      { label: `9' 6" High Cube (HC)`, value: `9' 6" High Cube (HC)` },
    ],
  },
  {
    label: "Container Type",
    property: "type",
    options: [
      { label: "All", value: null },
      {
        label: "Dry Van Shipping Container With Double Doors at 1 End",
        value: "Double Doors at 1 End",
      },
    ],
  },
] as const;

export function ShippingContainerFilters() {
  const searchParams = useSearchParams();

  return (
    <>
      {SHIPPING_CONTAINER_FILTERS.map((group) => {
        const current = searchParams.get(group.property);
        return (
          <div key={group.property} className="mt-3">
            <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-theme-muted">
              {group.label}
            </div>
            {group.options.map((option) => {
              const isSelected =
                option.value === null ? current === null : current === option.value;
              return (
                <Link
                  key={option.label}
                  href={buildFilterHref(searchParams, group.property, option.value)}
                  scroll={false}
                  className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-theme-dark-2 dark:text-gray-300 transition-colors hover:bg-theme-subtle dark:hover:bg-neutral-800"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="h-4 w-4 accent-red-600 pointer-events-none"
                  />
                  {option.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

export const PRODUCT_FILTERS = [
  { label: "Buy Shipping Container", param: "buy" },
  { label: "Rent Shipping Container", param: "rental" },
  { label: "Rent-To-Own Shipping Container", param: "rto" },
  { label: "Shipping Container Accessories", param: "accessories" },
];

export function FilterPanel({ zipcode, location, ptype = "buy" }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const searchParams = useSearchParams();
  const activePtype = searchParams.get("ptype") ?? ptype;

  return (
    <div className="flex flex-col gap-4">
      <ZipLookup initialZip={zipcode} location={location} ptype={activePtype} />

      <div className="rounded-lg border border-theme-border bg-white dark:bg-neutral-900 overflow-hidden">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={`flex w-full items-center justify-between px-4 py-3 text-base font-extrabold transition-colors hover:bg-theme-subtle dark:hover:bg-neutral-800 text-theme-dark dark:text-gray-100 ${
            filtersOpen ? "border-b border-theme-border dark:border-neutral-800" : ""
          }`}
        >
          Filter
          <ChevronDown
            size={16}
            className={`text-theme-muted transition-transform duration-200 ${filtersOpen ? "" : "-rotate-90"}`}
          />
        </button>

        {filtersOpen && (
          <div className="flex flex-col gap-1 px-4 py-3">
            <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-theme-muted dark:text-gray-500">
              Products
            </div>
            {PRODUCT_FILTERS.map((f) => (
              <Link
                key={f.label}
                href={buildFilterHref(searchParams, "ptype", f.param)}
                scroll={false}
                className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-theme-dark-2 dark:text-gray-300 transition-colors hover:bg-theme-subtle dark:hover:bg-neutral-800"
              >
                <input
                  type="checkbox"
                  checked={activePtype === f.param}
                  readOnly
                  className="h-4 w-4 accent-red-600 pointer-events-none"
                />
                {f.label}
              </Link>
            ))}
            <span className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-theme-muted dark:text-gray-600">
              <input
                type="checkbox"
                disabled
                className="h-4 w-4 accent-gray-400"
              />
              Onsite Specials
            </span>

            <ShippingContainerFilters />
          </div>
        )}
      </div>
    </div>
  );
}
