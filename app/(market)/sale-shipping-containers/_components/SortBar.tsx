'use client'

import { useRouter } from 'next/navigation'

type SortOption = { value: string; label: string }

type Props = {
  count: number
  location?: string
  currentSort: string
  baseParams: string
  currentPage: number
  maxPages: number
  sortOptions?: SortOption[]
  itemLabel?: string
}

const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { value: 'default',   label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'best_rated', label: 'Best Rated' },
]

export function SortBar({
  count,
  location,
  currentSort,
  baseParams,
  currentPage,
  maxPages,
  sortOptions,
  itemLabel = 'container',
}: Props) {
  const router = useRouter()
  const options = sortOptions ?? DEFAULT_SORT_OPTIONS

  function handleSort(value: string) {
    const params = new URLSearchParams(baseParams)
    if (value === 'default') params.delete('sort')
    else params.set('sort', value)
    params.delete('page')
    router.push(`/sale-shipping-containers?${params}`)
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-theme-border dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3">
      <div className="text-sm text-theme-muted dark:text-gray-400">
        <span className="font-bold text-theme-dark dark:text-gray-100">{count}</span>{' '}
        {itemLabel}{count !== 1 ? 's' : ''} found
        {location ? ` near ${location}` : ''}
        {maxPages > 1 && (
          <span className="ml-1 text-theme-muted dark:text-gray-500">(page {currentPage} of {maxPages})</span>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-theme-muted dark:text-gray-400">
        Sort:
        <select
          value={currentSort}
          onChange={(e) => handleSort(e.target.value)}
          className="rounded-md border border-theme-border dark:border-neutral-700 bg-white dark:bg-neutral-800 dark:text-gray-200 px-2.5 py-1.5 text-sm text-theme-dark-2 outline-none focus:border-theme-primary"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
