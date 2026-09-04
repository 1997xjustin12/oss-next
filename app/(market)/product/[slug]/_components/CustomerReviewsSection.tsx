'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GoogleReviewsBadge } from '@/components/shared/GoogleReviewsBadge'
import { REVIEWS, type Review } from '@/config/reviews'

/**
 * Google reviews on the product page.
 *
 * The homepage shows the same reviews in a centred, full-bleed band; this is
 * the product-page treatment — heading and rating on one line, then a row of
 * cards the shopper pages through.
 *
 * Scroll-driven rather than index-driven: the track is a real scroll container
 * with snap points, so a trackpad swipe, a shift-scroll and the arrow buttons
 * all move the same thing and cannot disagree about where it is. The arrows
 * nudge it by one card width; their disabled state is read back off the scroll
 * position rather than tracked separately.
 */

const SCROLL_EPSILON = 4

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-label="Posted on Google">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

/** The blue check Google shows against a review from a real account. */
function VerifiedBadge() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      role="img"
      aria-label="Verified reviewer"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="11" fill="#4285F4" />
      <path
        d="M7 12.5l3.2 3.2L17 9"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CardStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill={i <= rating ? '#FBBC04' : '#D1D5DB'}
          />
        </svg>
      ))}
    </div>
  )
}

/** ISO or long-form date rendered as `2025-05-02`, matching the design. */
function shortDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString().slice(0, 10)
}

/**
 * Roughly the number of characters that fill the card's four clamped lines.
 *
 * A character count rather than a measured overflow: measuring means reading
 * scrollHeight after paint and storing it, which is a render pass and a piece
 * of state per card to decide one link. Being a few characters out just shows
 * a "Read more" that expands by half a line — being wrong the other way, which
 * is what happens with no check at all, offers to expand a one-line review.
 */
const CLAMP_CHARS = 150

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false)
  const clampable = review.text.length > CLAMP_CHARS

  return (
    <article className="w-[268px] shrink-0 snap-start sm:w-[286px]">
      <div className="flex h-full flex-col gap-2.5 rounded-md bg-theme-subtle p-4 dark:bg-neutral-800">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Image
              src={review.avatar}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-theme-dark dark:text-white">
                {review.name}
              </div>
              <div className="text-[11px] text-theme-muted">{shortDate(review.date)}</div>
            </div>
          </div>
          <GoogleIcon />
        </div>

        <div className="flex items-center gap-1.5">
          <CardStars rating={review.rating} />
          <VerifiedBadge />
        </div>

        <p
          className={`text-[13px] leading-relaxed text-theme-mid dark:text-gray-300 ${
            clampable && !expanded ? 'line-clamp-4' : ''
          }`}
        >
          {review.text}
        </p>

        {clampable && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-auto self-start text-[11px] text-theme-muted underline underline-offset-2 transition-colors hover:text-theme-dark dark:hover:text-white"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </article>
  )
}

type ArrowProps = {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}

function Arrow({ direction, disabled, onClick }: ArrowProps) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous reviews' : 'Next reviews'}
      className={`absolute top-1/2 z-10 hidden -translate-y-1/2 p-1 text-theme-muted transition-colors hover:text-theme-dark disabled:cursor-not-allowed disabled:opacity-25 sm:block dark:hover:text-white ${
        direction === 'prev' ? '-left-6' : '-right-6'
      }`}
    >
      <Icon className="h-7 w-7" strokeWidth={1.5} />
    </button>
  )
}

export function CustomerReviewsSection({ heading = 'Customer Reviews:' }: { heading?: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const syncArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= SCROLL_EPSILON)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - SCROLL_EPSILON)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    syncArrows()
    el.addEventListener('scroll', syncArrows, { passive: true })

    // The end arrow also depends on how many cards fit, which changes with the
    // viewport and not with any scroll.
    const observer = new ResizeObserver(syncArrows)
    observer.observe(el)

    return () => {
      el.removeEventListener('scroll', syncArrows)
      observer.disconnect()
    }
  }, [syncArrows])

  function page(direction: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    // One card plus its gap, measured rather than assumed, so the step stays
    // right when the card width changes at a breakpoint.
    const card = el.firstElementChild as HTMLElement | null
    const step = card ? card.offsetWidth + 16 : el.clientWidth
    el.scrollBy({ left: step * direction, behavior: 'smooth' })
  }

  return (
    <section id="reviews" className="px-4 py-10 sm:px-[5%] sm:py-16">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[16px] md:text-[24px] font-bold text-theme-dark sm:text-2xl dark:text-white">
          {heading}
        </h2>
        <GoogleReviewsBadge linkCount />
      </div>

      <div className="relative">
        <Arrow direction="prev" disabled={atStart} onClick={() => page(-1)} />

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-none pb-1"
        >
          {REVIEWS.map((review, i) => (
            <ReviewCard key={`${review.name}-${i}`} review={review} />
          ))}
        </div>

        <Arrow direction="next" disabled={atEnd} onClick={() => page(1)} />
      </div>
    </section>
  )
}
