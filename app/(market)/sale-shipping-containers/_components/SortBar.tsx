'use client'

import { useRouter } from 'next/navigation'

type Props = {
  count: number
  location?: string
  currentSort: string
  baseParams: string
  currentPage: number
  maxPages: number
}

export function SortBar({ count, location, currentSort, baseParams, currentPage, maxPages }: Props) {
  const router = useRouter()

  function handleSort(value: string) {
    const params = new URLSearchParams(baseParams)
    if (value === 'default') params.delete('sort')
    else params.set('sort', value)
    params.delete('page') // reset to page 1 on sort change
    router.push(`/sale-shipping-containers?${params}`)
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-theme-border bg-white px-4 py-3">
      <div className="text-sm text-theme-muted">
        <span className="font-bold text-theme-dark">{count}</span>{' '}
        container{count !== 1 ? 's' : ''} found
        {location ? ` near ${location}` : ''}
        {maxPages > 1 && (
          <span className="ml-1 text-theme-muted">(page {currentPage} of {maxPages})</span>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-theme-muted">
        Sort:
        <select
          value={currentSort}
          onChange={(e) => handleSort(e.target.value)}
          className="rounded-md border border-theme-border bg-white px-2.5 py-1.5 text-sm text-theme-dark-2 outline-none focus:border-theme-primary"
        >
          <option value="default">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="best_rated">Best Rated</option>
        </select>
      </label>
    </div>
  )
}
