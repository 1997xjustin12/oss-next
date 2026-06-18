'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ZipLookup } from './ZipLookup'

type Props = {
  zipcode?: string
  location?: string
  ptype?: string
}

const PRODUCT_FILTERS = [
  { label: 'Buy Shipping Container',         param: 'buy' },
  { label: 'Rent Shipping Container',         param: 'rent' },
  { label: 'Rent-To-Own Shipping Container',  param: 'rto' },
  { label: 'Shipping Container Accessories',  param: 'accessories' },
]

export function FilterPanel({ zipcode, location, ptype = 'buy' }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(true)

  return (
    <div className="flex flex-col gap-4">
      <ZipLookup initialZip={zipcode} location={location} ptype={ptype} />

      {/* Collapsible filters */}
      <div className="rounded-lg border border-theme-border bg-white overflow-hidden">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className={`flex w-full items-center justify-between px-4 py-3 text-base font-extrabold transition-colors hover:bg-theme-subtle ${
            filtersOpen ? 'border-b border-theme-border' : ''
          }`}
        >
          Filter
          <ChevronDown
            size={16}
            className={`text-theme-muted transition-transform duration-200 ${filtersOpen ? '' : '-rotate-90'}`}
          />
        </button>

        {filtersOpen && (
          <div className="flex flex-col gap-1 px-4 py-3">
            <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-theme-muted">
              Products
            </div>
            {PRODUCT_FILTERS.map((f) => (
              <label
                key={f.label}
                className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-theme-dark-2 transition-colors hover:bg-theme-subtle cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked={ptype === f.param}
                  className="h-4 w-4 accent-red-600"
                />
                {f.label}
              </label>
            ))}
            <label className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-theme-muted">
              <input type="checkbox" disabled className="h-4 w-4 accent-gray-400" />
              Onsite Specials
            </label>

            <div className="mb-1 mt-3 text-[10px] font-extrabold uppercase tracking-wider text-theme-muted">
              Payment Terms
            </div>
            <label className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-theme-dark-2 transition-colors hover:bg-theme-subtle cursor-pointer">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-red-600" />
              Buy
            </label>

            <div className="mb-1 mt-3 text-[10px] font-extrabold uppercase tracking-wider text-theme-muted">
              Size / Length
            </div>
            <label className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm text-theme-dark-2 transition-colors hover:bg-theme-subtle cursor-pointer">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-red-600" />
              All
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
