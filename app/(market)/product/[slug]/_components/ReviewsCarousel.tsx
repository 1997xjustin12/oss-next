'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Stars } from '@/components/product/Stars'
import type { Review } from '@/types/review'

type Props = { productId: string | number }

// Same carousel structure/behavior as the homepage's ReviewsSection.tsx
// (auto-advance, snap-scroll track, prev/next + dot pagination), but sourced
// from our own backend (GET /api/reviews/list?product_id=...) instead of
// WordPress or hardcoded data. Meant to eventually replace CustomerReviews.tsx
// on the PDP once the OSS reviews table has enough approved reviews to be
// worth switching to — see ProductDetail.tsx for the current wiring.
const AVATAR_COLORS = ['bg-theme-primary', 'bg-theme-dark', 'bg-theme-accent']

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2)
  return parts.map((s) => s[0]!.toUpperCase()).join('') || '?'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function ReviewCardSkeleton() {
  return (
    <div className="snap-start shrink-0 w-full sm:w-1/2 lg:w-1/3 pr-4 sm:pr-6">
      <div className="h-full rounded-lg border border-theme-border bg-theme-bg p-5 sm:p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-theme-subtle shrink-0" />
          <div className="flex-1">
            <div className="h-3 w-24 bg-theme-subtle rounded mb-1.5" />
            <div className="h-2.5 w-16 bg-theme-subtle rounded" />
          </div>
        </div>
        <div className="h-3 w-full bg-theme-subtle rounded mb-1.5" />
        <div className="h-3 w-3/4 bg-theme-subtle rounded" />
      </div>
    </div>
  )
}

function ReviewCard({ review, colorIndex }: { review: Review; colorIndex: number }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <article className="snap-start shrink-0 w-full sm:w-1/2 lg:w-1/3 pr-4 sm:pr-6">
      <div className="h-full flex flex-col gap-3 rounded-lg border border-theme-border bg-theme-bg p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold ${AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]}`}
          >
            {initials(review.user.username)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{review.user.username}</div>
            <div className="text-xs text-theme-muted">{formatDate(review.created_at)}</div>
          </div>
        </div>
        <Stars count={review.rating} className="w-4 h-4" />
        {review.title && <p className="text-sm font-bold">{review.title}</p>}
        <p className={`text-sm text-theme-mid leading-relaxed ${expanded ? '' : 'line-clamp-5'}`}>
          {review.comment}
        </p>
        {review.comment.length > 180 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="self-start text-xs font-semibold text-theme-primary hover:underline"
          >
            {expanded ? 'Hide' : 'Read more'}
          </button>
        )}
      </div>
    </article>
  )
}

// 5→1 star breakdown, computed from the same review list already in memory
// (the fetch has no pagination, so `reviews` is always the full set).
function RatingDistribution({ reviews }: { reviews: Review[] }) {
  const total = reviews.length
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => Math.round(r.rating) === star).length
        const pct = total ? (count / total) * 100 : 0
        return (
          <div key={`rating-dist-${star}`} className="flex items-center gap-2 text-xs">
            <span className="w-10 shrink-0 text-right font-semibold text-theme-dark">{star} star</span>
            <div className="flex-1 h-2 rounded-full bg-theme-border overflow-hidden">
              <div className="h-full rounded-full bg-theme-primary transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-6 shrink-0 text-theme-muted">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

export function ReviewsCarousel({ productId }: Props) {
  // `loaded.productId` tracks which product `reviews` belongs to — `loading`
  // is derived from the two being out of sync, rather than a separate reset
  // call inside the fetch effect (same pattern as CustomerReviews.tsx).
  const [loaded, setLoaded] = useState<{ productId: Props['productId']; reviews: Review[] } | null>(null)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visibleCount, setVisibleCount] = useState(3)
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/reviews/list?product_id=${productId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { results?: Review[] } | null) => {
        if (cancelled) return
        setLoaded({ productId, reviews: data?.results ?? [] })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ productId, reviews: [] })
      })

    return () => {
      cancelled = true
    }
  }, [productId])

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setVisibleCount(w < 640 ? 1 : w < 1024 ? 2 : 3)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const loading = !loaded || loaded.productId !== productId
  const list = loading ? [] : loaded.reviews
  const maxIndex = Math.max(0, list.length - visibleCount)
  // Clamped at render time instead of via a setState-in-effect — current can
  // momentarily exceed maxIndex right after list/visibleCount shrinks, but is
  // never read unclamped below.
  const clampedCurrent = Math.min(current, maxIndex)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return
    const card = track.children[clampedCurrent] as HTMLElement | undefined
    if (card) container.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
  }, [clampedCurrent])

  useEffect(() => {
    if (paused || list.length <= visibleCount) return
    const timer = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1))
    }, 6000)
    return () => clearInterval(timer)
  }, [paused, maxIndex, list.length, visibleCount])

  const goTo = (index: number) => setCurrent(Math.max(0, Math.min(index, maxIndex)))

  const average = list.length ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : 0

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6 sm:gap-8 items-center bg-theme-subtle border border-theme-border rounded-xl p-6 sm:p-7 mb-7">
        <div className="flex flex-col items-center text-center">
          <div className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            {list.length ? average.toFixed(1) : '—'}
          </div>
          <Stars count={Math.round(average)} className="w-5 h-5" />
          <div className="text-xs text-theme-muted mt-1">
            {loading ? 'Loading reviews…' : `${list.length} review${list.length === 1 ? '' : 's'}`}
          </div>
        </div>
        <RatingDistribution reviews={list} />
      </div>

      {loading && (
        <div className="flex overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReviewCardSkeleton key={`review-carousel-skeleton-${i}`} />
          ))}
        </div>
      )}

      {!loading && list.length === 0 && (
        <p className="text-sm text-theme-muted text-center py-8">No reviews yet for this product.</p>
      )}

      {!loading && list.length > 0 && (
        <div className="relative">
          {list.length > visibleCount && (
            <button
              type="button"
              onClick={() => goTo(clampedCurrent - 1)}
              disabled={clampedCurrent === 0}
              aria-label="Previous reviews"
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-theme-bg rounded-full shadow-md border border-theme-border text-theme-dark disabled:opacity-30 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div
            ref={containerRef}
            className="overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div ref={trackRef} className="flex snap-x snap-mandatory">
              {list.map((review, i) => (
                <ReviewCard key={`review-carousel-${review.id}-${i}`} review={review} colorIndex={i} />
              ))}
            </div>
          </div>

          {list.length > visibleCount && (
            <button
              type="button"
              onClick={() => goTo(clampedCurrent + 1)}
              disabled={clampedCurrent >= maxIndex}
              aria-label="Next reviews"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-theme-bg rounded-full shadow-md border border-theme-border text-theme-dark disabled:opacity-30 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {maxIndex > 0 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex + 1 }, (_, i) => (
                <button
                  key={`review-carousel-dot-${i}`}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to review set ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-colors ${i === clampedCurrent ? 'bg-theme-primary' : 'bg-theme-border'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
