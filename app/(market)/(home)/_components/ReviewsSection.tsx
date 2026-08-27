'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { AccentText } from '@/components/shared/AccentText';
import { HOME_HEADING_DEFAULTS } from '@/config/homeContent';
import { REVIEWS, type Review } from '@/config/reviews';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            fill={i <= rating ? "#FBBC04" : "#D1D5DB"}
          />
        </svg>
      ))}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-label="Posted on Google">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  return (
    // pr-4 sm:pr-6 acts as the gap between cards while keeping widths exact percentages
    <article className="snap-start shrink-0 w-full sm:w-1/2 lg:w-1/3 pr-4 sm:pr-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={review.avatar}
              alt={`${review.name} profile picture`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <div className="font-semibold text-sm dark:text-white">{review.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{review.date}</div>
            </div>
          </div>
          <GoogleIcon />
        </div>
        <Stars rating={review.rating} />
        <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${expanded ? '' : 'line-clamp-5'}`}>
          {review.text}
        </p>
        <button
          onClick={() => setExpanded((e) => !e)}
          className="self-start text-xs font-semibold text-[#C60C29] hover:underline"
        >
          {expanded ? 'Hide' : 'Read more'}
        </button>
      </div>
    </article>
  );
}

// Client Component — (home)/page.tsx resolves the heading and passes it in.
export function ReviewsSection({
  heading = HOME_HEADING_DEFAULTS['reviews.h2'],
}: {
  heading?: string;
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const maxIndex = REVIEWS.length - visibleCount;

  // Update visibleCount on breakpoint change
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Clamp current when maxIndex shrinks (e.g. expanding viewport)
  useEffect(() => {
    setCurrent((c) => Math.min(c, maxIndex));
  }, [maxIndex]);

  // Sync scroll position whenever current changes
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;
    const card = track.children[current] as HTMLElement | undefined;
    if (card) container.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  }, [current]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, maxIndex]);

  const goTo = (index: number) => setCurrent(Math.max(0, Math.min(index, maxIndex)));

  return (
    <section className="py-10 sm:py-16 bg-[#F7F7F7] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-5 sm:px-10">
        <h2 className="text-[28px] sm:text-[36px] font-bold text-center mb-8 sm:mb-10 dark:text-white">
          <AccentText text={heading} accentClassName="text-[#C60C29]" />
        </h2>

        <div className="relative">
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            aria-label="Previous reviews"
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 text-xl disabled:opacity-30 transition-opacity"
          >
            ‹
          </button>

          {/* overflow-hidden + programmatic scrollTo hides the other cards */}
          <div
            ref={containerRef}
            className="overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div ref={trackRef} className="flex snap-x snap-mandatory">
              {REVIEWS.map((review, i) => (
                <ReviewCard key={i} review={review} />
              ))}
            </div>
          </div>

          <button
            onClick={() => goTo(current + 1)}
            disabled={current >= maxIndex}
            aria-label="Next reviews"
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 text-xl disabled:opacity-30 transition-opacity"
          >
            ›
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6 sm:mt-8">
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to review set ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? 'bg-[#C60C29]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
