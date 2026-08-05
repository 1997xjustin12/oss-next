'use client';

import { useEffect, useRef, useState } from 'react';
import { AccentText } from '@/components/shared/AccentText';
import { HOME_HEADING_DEFAULTS } from '@/config/homeContent';
import type { Review } from '@/types/review';

// Same carousel mechanics/visual language as ReviewsSection.tsx (its
// hardcoded sibling), but fetching the real, site-wide review feed from our
// own backend instead — GET /api/reviews/list with no product_id, per
// docs/reference/REVIEWS_FLOW.md ("omit to get a site-wide review feed"). Differences from
// the static version: no avatar photo (OSS reviews carry none, so initials
// are used instead) and no Google badge (these aren't Google reviews).
// Rendered alongside ReviewsSection.tsx on the homepage for comparison —
// see (home)/page.tsx.
const AVATAR_COLORS = ['bg-[#C60C29]', 'bg-gray-900', 'bg-gray-600'];

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((s) => s[0]!.toUpperCase()).join('') || '?';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill={i <= rating ? '#FBBC04' : '#D1D5DB'}
          />
        </svg>
      ))}
    </div>
  );
}

function ReviewCardSkeleton() {
  return (
    <div className="snap-start shrink-0 w-full sm:w-1/2 lg:w-1/3 pr-4 sm:pr-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1">
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
            <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

function ReviewCard({ review, colorIndex }: { review: Review; colorIndex: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="snap-start shrink-0 w-full sm:w-1/2 lg:w-1/3 pr-4 sm:pr-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 h-full">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold ${AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]}`}
          >
            {initials(review.user.username)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm dark:text-white truncate">{review.user.username}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(review.created_at)}</div>
          </div>
        </div>
        <Stars rating={review.rating} />
        {review.title && <p className="text-sm font-bold dark:text-white">{review.title}</p>}
        <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${expanded ? '' : 'line-clamp-5'}`}>
          {review.comment}
        </p>
        {review.product?.title && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            on <span className="font-semibold">{review.product.title}</span>
          </p>
        )}
        {review.comment.length > 180 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="self-start text-xs font-semibold text-[#C60C29] hover:underline"
          >
            {expanded ? 'Hide' : 'Read more'}
          </button>
        )}
      </div>
    </article>
  );
}

// Shares the static section's heading — one edit updates both, since this is a
// side-by-side comparison of the same section, not a second one.
export function ReviewsSectionLive({
  heading = HOME_HEADING_DEFAULTS['reviews.h2'],
}: {
  heading?: string;
}) {
  const [loaded, setLoaded] = useState<Review[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/reviews/list')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { results?: Review[] } | null) => {
        if (cancelled) return;
        setLoaded(data?.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setLoaded([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const loading = loaded === null;
  const reviews = loaded ?? [];
  const maxIndex = Math.max(0, reviews.length - visibleCount);
  const clampedCurrent = Math.min(current, maxIndex);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;
    const card = track.children[clampedCurrent] as HTMLElement | undefined;
    if (card) container.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  }, [clampedCurrent]);

  useEffect(() => {
    if (paused || reviews.length <= visibleCount) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, maxIndex, reviews.length, visibleCount]);

  const goTo = (index: number) => setCurrent(Math.max(0, Math.min(index, maxIndex)));

  return (
    <section className="py-10 sm:py-16 bg-[#F7F7F7] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-5 sm:px-10">
        <h2 className="text-[28px] sm:text-[36px] font-bold text-center mb-8 sm:mb-10 dark:text-white">
          <AccentText text={heading} accentClassName="text-[#C60C29]" />
          <span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-2">
            (live from our backend — for comparison)
          </span>
        </h2>

        {loading && (
          <div className="flex overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReviewCardSkeleton key={`reviews-live-skeleton-${i}`} />
            ))}
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No reviews yet.
          </p>
        )}

        {!loading && reviews.length > 0 && (
          <div className="relative">
            {reviews.length > visibleCount && (
              <button
                onClick={() => goTo(clampedCurrent - 1)}
                disabled={clampedCurrent === 0}
                aria-label="Previous reviews"
                className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 text-xl disabled:opacity-30 transition-opacity"
              >
                ‹
              </button>
            )}

            <div
              ref={containerRef}
              className="overflow-hidden"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div ref={trackRef} className="flex snap-x snap-mandatory">
                {reviews.map((review, i) => (
                  <ReviewCard key={`reviews-live-${review.id}-${i}`} review={review} colorIndex={i} />
                ))}
              </div>
            </div>

            {reviews.length > visibleCount && (
              <button
                onClick={() => goTo(clampedCurrent + 1)}
                disabled={clampedCurrent >= maxIndex}
                aria-label="Next reviews"
                className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 text-xl disabled:opacity-30 transition-opacity"
              >
                ›
              </button>
            )}

            {maxIndex > 0 && (
              <div className="flex justify-center gap-2 mt-6 sm:mt-8">
                {Array.from({ length: maxIndex + 1 }, (_, i) => (
                  <button
                    key={`reviews-live-dot-${i}`}
                    onClick={() => goTo(i)}
                    aria-label={`Go to review set ${i + 1}`}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === clampedCurrent ? 'bg-[#C60C29]' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
