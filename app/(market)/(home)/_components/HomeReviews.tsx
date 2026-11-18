"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AccentText } from "@/components/shared/AccentText";
import { GoogleReviewsBadge } from "@/components/shared/GoogleReviewsBadge";
import { SourceMark } from "@/components/shared/ReviewsSection";
import { GOOGLE_REVIEW_STATS, type Review } from "@/config/reviews";
import { HOME_HEADING_DEFAULTS } from "@/config/homeContent";
import { reviewerInitials } from "@/lib/storeReviews";

const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path
            d={STAR_PATH}
            className={
              i <= rating
                ? "fill-[#FBBC04]"
                : "fill-neutral-300 dark:fill-neutral-600"
            }
          />
        </svg>
      ))}
    </span>
  );
}

/** Google's blue "verified" tick, beside a Google review's stars (the design). */
function VerifiedTick() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-label="Verified Google review"
      role="img"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M12 1l2.6 2.3 3.4-.5 1.2 3.2 3.2 1.2-.5 3.4L23 12l-2.3 2.6.5 3.4-3.2 1.2-1.2 3.2-3.4-.5L12 23l-2.6-2.3-3.4.5-1.2-3.2-3.2-1.2.5-3.4L1 12l2.3-2.6-.5-3.4 3.2-1.2L7.2 1.6l3.4.5z"
      />
      <path
        d="M7.5 12.3l3 3 6-6.3"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  // "Read more" only where the text is cut off; a short review has nothing more to read.
  const textRef = useRef<HTMLParagraphElement>(null);
  const [clamped, setClamped] = useState(false);
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const check = () => {
      // Measured only while clamped, so expanding never hides its own "Show less".
      if (el.classList.contains("line-clamp-4")) setClamped(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const google = !review.source || review.source === "google";
  return (
    <article className="flex h-full flex-col rounded-sm bg-neutral-100 p-4 sm:p-5 dark:bg-neutral-900 dark:ring-1 dark:ring-white/10">
      <header className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          {review.avatar ? (
            <Image
              src={review.avatar}
              alt=""
              width={40}
              height={40}
              // As ReviewsSection: Google serves these at 40px already, and refuses
              // a request that names another site as its referrer.
              unoptimized
              referrerPolicy="no-referrer"
              className="h-10 w-10 shrink-0 rounded-full"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-primary text-sm font-bold text-white"
            >
              {reviewerInitials(review.name)}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
              {review.name}
            </h3>
            <p className="text-xs whitespace-nowrap text-neutral-500 dark:text-neutral-400">
              {review.date}
            </p>
          </div>
        </div>
        <SourceMark review={review} />
      </header>

      <div className="mt-4 flex items-center gap-1.5">
        <Stars rating={review.rating} />
        {google && <VerifiedTick />}
      </div>

      <p
        ref={textRef}
        className={`mt-2 text-[15px] leading-snug text-neutral-800 dark:text-neutral-200 ${expanded ? "" : "line-clamp-4"}`}
      >
        {review.text}
      </p>
      {(clamped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mt-auto self-start pt-3 text-[13px] text-neutral-500 hover:text-theme-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary dark:text-neutral-400 dark:hover:text-red-400"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </article>
  );
}

/** A ‹ / › beside the track, from `sm` (a phone swipes, with the next cards peeking in). */
function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 1 | -1;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === 1 ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 1 ? "Next reviews" : "Previous reviews"}
      className={`absolute top-1/2 z-10 hidden h-12 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-neutral-400 transition-colors hover:text-neutral-800 focus-visible:outline-2 focus-visible:outline-theme-primary disabled:pointer-events-none disabled:opacity-0 sm:flex dark:text-neutral-500 dark:hover:text-white ${
        direction === 1 ? "-right-8 lg:-right-11" : "-left-8 lg:-left-11"
      }`}
    >
      <Icon aria-hidden className="h-7 w-7" strokeWidth={1.5} />
    </button>
  );
}

/**
 * The homepage's "What Our Customers Say" (the 2026-11-18 design): a red
 * heading, a line on the rating, the Google badge (GOOGLE_REVIEW_STATS, the
 * one place the rating and count are set), then the review cards in a
 * carousel: five across from 1440px, four from `lg`, three from `md`, two from
 * `sm`, and on a phone one with its neighbours peeking in, to swipe.
 *
 * `reviews` is the merged list HomePage already loads (getReviews(): this
 * site's own, REVIEWS.io and Google). Homepage only: the other pages keep the
 * shared ReviewsSection.
 */
export function HomeReviews({
  heading = HOME_HEADING_DEFAULTS["reviews.h2"],
  reviews,
}: {
  heading?: string;
  reviews: Review[];
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const sync = () => {
      setAtStart(el.scrollLeft <= 1);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    };
    const frame = requestAnimationFrame(sync);
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  /** One card along (its width plus the gap). */
  function move(direction: 1 | -1) {
    const el = trackRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({
      left: direction * (card.offsetWidth + gap),
      behavior: "smooth",
    });
  }

  return (
    <section
      aria-labelledby="home-reviews-title"
      className="bg-white px-[5%] py-10 sm:py-14 dark:bg-neutral-950"
    >
      <div className="text-center">
        <h2
          id="home-reviews-title"
          className="text-2xl leading-tight font-bold text-theme-primary sm:text-3xl lg:text-[34px] dark:text-red-400"
        >
          <AccentText
            text={heading}
            accentClassName="text-theme-primary dark:text-red-400"
          />
        </h2>
        <p className="mx-auto mt-2 hidden max-w-4xl text-base text-neutral-900 sm:block lg:text-lg dark:text-neutral-200">
          Customers rate us {GOOGLE_REVIEW_STATS.rating} stars across Google and
          REVIEWS.io for container quality, fast delivery, and clear
          communication.
        </p>
        <GoogleReviewsBadge showRating className="mx-auto mt-4" />
      </div>

      <div className="relative mt-6 sm:mt-8">
        <ArrowButton
          direction={-1}
          disabled={atStart}
          onClick={() => move(-1)}
        />
        <ul
          ref={trackRef}
          aria-label="Customer reviews"
          // Phone: the track runs to the screen edges and centres one card, the next ones peeking in.
          // From sm: inside the gutter, cards sized so 2 / 3 / 4 / 5 fit exactly.
          className="-mx-[5vw] flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-[12vw] py-1 scrollbar-none sm:mx-0 sm:gap-4 sm:px-0"
        >
          {reviews.map((review, i) => (
            <li
              key={review.id ?? `google-${i}`}
              className="w-[76vw] shrink-0 snap-center sm:w-[calc((100%-1rem)/2)] sm:snap-start md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] min-[90rem]:w-[calc((100%-4rem)/5)]"
            >
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
        <ArrowButton direction={1} disabled={atEnd} onClick={() => move(1)} />
      </div>
    </section>
  );
}
