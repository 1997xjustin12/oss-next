'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import {
  SHIPPING_CONTAINER_FILTERS,
  PRODUCT_FILTERS,
  buildFilterHref,
} from './FilterPanel'

const FILTER_DISPLAY_NAMES: Record<string, string> = {
  length_width: 'Size',
  condition:    'Condition',
  grade:        'Grade',
  height:       'Height',
  type:         'Type',
}

const PTYPE_LABELS: Record<string, string> = {
  buy:         'Buy',
  rental:      'Rent',
  rto:         'Rent-To-Own',
  accessories: 'Accessories',
}

type Props = { ptype?: string }

function ActiveChips() {
  const searchParams = useSearchParams()

  const chips = (Object.keys(FILTER_DISPLAY_NAMES) as string[])
    .filter((p) => searchParams.has(p))
    .map((p) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(p)
      params.delete('page')
      return {
        key:   p,
        label: `${FILTER_DISPLAY_NAMES[p]}: ${searchParams.get(p)}`,
        href:  `?${params.toString()}`,
      }
    })

  // Non-default ptype chip
  const ptypeVal = searchParams.get('ptype')
  if (ptypeVal && ptypeVal !== 'buy') {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('ptype')
    params.delete('page')
    chips.unshift({ key: 'ptype', label: `Category: ${PTYPE_LABELS[ptypeVal] ?? ptypeVal}`, href: `?${params.toString()}` })
  }

  if (chips.length === 0) return null

  const clearAllParams = new URLSearchParams(searchParams.toString())
  ;['length_width', 'condition', 'grade', 'height', 'type', 'ptype'].forEach((p) => clearAllParams.delete(p))
  clearAllParams.delete('page')

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          scroll={false}
          className="flex items-center gap-1 shrink-0 rounded-full bg-theme-primary/10 dark:bg-theme-primary/20 border border-theme-primary/25 px-3 py-1 text-xs font-semibold text-theme-primary hover:bg-theme-primary/20 transition-colors"
        >
          {chip.label}
          <X size={11} strokeWidth={2.5} />
        </Link>
      ))}
      {chips.length > 1 && (
        <Link
          href={`?${clearAllParams.toString()}`}
          scroll={false}
          className="flex items-center gap-1 shrink-0 rounded-full border border-theme-border dark:border-neutral-700 bg-theme-subtle dark:bg-neutral-800 px-3 py-1 text-xs font-semibold text-theme-muted dark:text-gray-400 hover:text-theme-dark dark:hover:text-gray-200 transition-colors"
        >
          Clear all
        </Link>
      )}
    </div>
  )
}

export function MobileFilterSheet({ ptype = 'buy' }: Props) {
  const [open, setOpen] = useState(false)
  const searchParams = useSearchParams()

  const activeCount = ['length_width', 'condition', 'grade', 'height', 'type'].filter(
    (p) => searchParams.has(p),
  ).length

  const activePtype = searchParams.get('ptype') ?? ptype

  return (
    <>
      {/* Chips + trigger row */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-theme-border dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm font-semibold text-theme-dark-2 dark:text-gray-200 hover:border-theme-primary dark:hover:border-theme-primary transition-colors"
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeCount > 0 && (
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-theme-primary text-[10px] font-black text-white leading-none">
              {activeCount}
            </span>
          )}
        </button>
        <ActiveChips />
      </div>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white dark:bg-neutral-950 shadow-2xl transition-transform duration-300 ease-out max-h-[88vh] ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-theme-border dark:bg-neutral-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-theme-border dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-theme-primary" />
            <span className="font-extrabold text-base text-theme-dark dark:text-gray-100">Filters</span>
            {activeCount > 0 && (
              <span className="text-xs font-bold text-theme-primary">· {activeCount} active</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <Link
                href={`?${(() => { const p = new URLSearchParams(searchParams.toString()); ['length_width','condition','grade','height','type','ptype'].forEach(k => p.delete(k)); p.delete('page'); return p.toString() })()}`}
                scroll={false}
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-theme-muted dark:text-gray-400 hover:text-theme-primary transition-colors"
              >
                Clear all
              </Link>
            )}
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-theme-subtle dark:bg-neutral-800 text-theme-muted dark:text-gray-400 hover:text-theme-dark dark:hover:text-gray-200 transition-colors"
              aria-label="Close filters"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable filter content */}
        <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5">
          {/* Category / product type */}
          <div>
            <div className="mb-2.5 text-[10px] font-extrabold uppercase tracking-widest text-theme-muted dark:text-gray-500">
              Category
            </div>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_FILTERS.map((f) => {
                const isSelected = activePtype === f.param
                return (
                  <Link
                    key={f.label}
                    href={buildFilterHref(searchParams, 'ptype', f.param)}
                    scroll={false}
                    onClick={() => setOpen(false)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors ${
                      isSelected
                        ? 'bg-theme-primary text-white border-theme-primary'
                        : 'bg-white dark:bg-neutral-900 text-theme-dark-2 dark:text-gray-300 border-theme-border dark:border-neutral-700 hover:border-theme-primary dark:hover:border-theme-primary'
                    }`}
                  >
                    {f.label.replace(' Shipping Container', '')}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Shipping container filters */}
          {SHIPPING_CONTAINER_FILTERS.map((group) => {
            const current = searchParams.get(group.property)
            return (
              <div key={group.property}>
                <div className="mb-2.5 text-[10px] font-extrabold uppercase tracking-widest text-theme-muted dark:text-gray-500">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const isSelected =
                      option.value === null ? current === null : current === option.value
                    return (
                      <Link
                        key={option.label}
                        href={buildFilterHref(searchParams, group.property, option.value)}
                        scroll={false}
                        onClick={() => setOpen(false)}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold border transition-colors ${
                          isSelected
                            ? 'bg-theme-primary text-white border-theme-primary'
                            : 'bg-white dark:bg-neutral-900 text-theme-dark-2 dark:text-gray-300 border-theme-border dark:border-neutral-700 hover:border-theme-primary dark:hover:border-theme-primary'
                        }`}
                      >
                        {option.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-theme-border dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <button
            onClick={() => setOpen(false)}
            className="w-full rounded-lg bg-theme-primary py-3 text-sm font-extrabold text-white hover:bg-theme-primary-dark transition-colors"
          >
            Show Results
          </button>
        </div>
      </div>
    </>
  )
}
