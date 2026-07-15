'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Stars } from '@/components/product/Stars'
import type { ContainerVariantKey } from '@/lib/containerVariant'
import type { ProductReview } from '@/services/review.service'

type Props = { variant: ContainerVariantKey }

const PAGE_SIZE = 3
// The WordPress endpoint has no offset/page param — fetch one batch per
// variant and paginate over it client-side instead of re-fetching per page.
const FETCH_LIMIT = 15

function ReviewCardSkeleton() {
  return (
    <div className="bg-theme-bg border border-theme-border rounded-lg p-4 sm:p-5 animate-pulse">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-full bg-theme-subtle shrink-0" />
        <div className="flex-1">
          <div className="h-3 w-24 bg-theme-subtle rounded mb-1.5" />
          <div className="h-2.5 w-16 bg-theme-subtle rounded" />
        </div>
      </div>
      <div className="h-3 w-full bg-theme-subtle rounded mb-1.5" />
      <div className="h-3 w-3/4 bg-theme-subtle rounded" />
    </div>
  )
}

export function CustomerReviews({ variant }: Props) {
  // `loaded.variant` tracks which variant `reviews` belongs to — `loading` is
  // derived from the two being out of sync, rather than a separate state flag
  // set synchronously inside the effect.
  const [loaded, setLoaded] = useState<{ variant: ContainerVariantKey; reviews: ProductReview[] } | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/reviews?variant=${variant}&limit=${FETCH_LIMIT}`)
      .then((res) => (res.ok ? res.json() : { reviews: [] }))
      .then((data: { reviews?: ProductReview[] }) => {
        if (cancelled) return
        setLoaded({ variant, reviews: data.reviews ?? [] })
        setPage(1)
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded({ variant, reviews: [] })
          setPage(1)
        }
      })

    return () => { cancelled = true }
  }, [variant])

  const reviews = loaded && loaded.variant === variant ? loaded.reviews : []
  const loading = !loaded || loaded.variant !== variant
  const rated = reviews.filter((r) => r.rating > 0)
  const average = rated.length ? rated.reduce((sum, r) => sum + r.rating, 0) / rated.length : 0
  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE))
  const pageItems = reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6 sm:gap-8 items-center bg-theme-subtle border border-theme-border rounded-xl p-6 sm:p-7 mb-7">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            {rated.length ? average.toFixed(1) : '—'}
          </div>
          <Stars count={Math.round(average)} className="w-5 h-5" />
          <div className="text-xs text-theme-muted mt-1">
            {loading ? 'Loading reviews…' : `${reviews.length} review${reviews.length === 1 ? '' : 's'} for this size`}
          </div>
        </div>
        <p className="text-sm text-theme-mid leading-relaxed">
          Reviews shown here are pulled from containers matching this size —{' '}
          {variant === '20S' ? '20 ft Standard' : variant === '40S' ? '40 ft Standard' : '40 ft High Cube'}.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col gap-3.5">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ReviewCardSkeleton key={`review-skeleton-${i}`} />
          ))}
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-theme-muted text-center py-8">
          No reviews yet for this container size.
        </p>
      )}

      {!loading && reviews.length > 0 && (
        <>
          <div className="flex flex-col gap-3.5">
            {pageItems.map((rev, index) => (
              <div
                key={`customer-reviews-${rev.id}-${index}`}
                className="bg-theme-bg border border-theme-border rounded-lg p-4 sm:p-5 hover:border-theme-primary hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Image
                      src={rev.avatarUrl}
                      alt={rev.author}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full shrink-0 bg-theme-subtle"
                    />
                    <div className="min-w-0">
                      <span className="block font-bold text-sm truncate">{rev.author}</span>
                      <span className="block text-xs text-theme-muted">{rev.formattedDate}</span>
                    </div>
                  </div>
                  {rev.rating > 0 && (
                    <div className="text-right shrink-0">
                      <Stars count={rev.rating} className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-theme-mid italic leading-relaxed">&ldquo;{rev.text}&rdquo;</p>
                {rev.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded mt-2.5">
                    <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                  </span>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 flex-wrap">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md border border-theme-border text-theme-mid hover:border-theme-primary hover:text-theme-primary disabled:opacity-30 disabled:hover:border-theme-border disabled:hover:text-theme-mid transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={`review-pagination-${pageNum}-${i}`}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    aria-label={`Page ${pageNum}`}
                    aria-current={page === pageNum ? 'page' : undefined}
                    className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md text-sm font-bold transition-colors ${
                      page === pageNum
                        ? 'bg-theme-primary text-white'
                        : 'border border-theme-border text-theme-mid hover:border-theme-primary hover:text-theme-primary'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md border border-theme-border text-theme-mid hover:border-theme-primary hover:text-theme-primary disabled:opacity-30 disabled:hover:border-theme-border disabled:hover:text-theme-mid transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
