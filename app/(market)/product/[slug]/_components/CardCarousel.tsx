"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * One card at a time on a phone, a static grid from `sm` up.
 *
 * Takes its children already rendered, so the cards themselves stay Server
 * Components — only the scrolling and the dots need to be client-side.
 *
 * Each card is exactly the width of the track, so a swipe lands on a whole
 * card rather than between two. The previous version sized them at 75% inside
 * a track pulled out by a negative margin, which put the first card four pixels
 * off the left edge and showed slivers of two cards at once instead of one.
 *
 * The dots read their position back off `scrollLeft` rather than tracking it
 * separately, so a swipe, a dot tap and a keyboard scroll cannot disagree about
 * which card is showing.
 */

type Props = {
  children: ReactNode;
  /** Grid applied from `sm` up, where the carousel stops being one. */
  gridClassName?: string;
  /** Describes the set for assistive tech, e.g. "Related containers". */
  label?: string;
};

export function CardCarousel({
  children,
  gridClassName = "sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8",
  label,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = Children.count(children);

  const syncActive = useCallback(() => {
    const el = trackRef.current;
    if (!el || count === 0) return;
    // Width of one card plus its gap, measured rather than assumed, so this
    // holds if the gap changes.
    const step = el.scrollWidth / count;
    setActive(Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  }, [count]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", syncActive, { passive: true });
    return () => el.removeEventListener("scroll", syncActive);
  }, [syncActive]);

  function goTo(index: number) {
    const el = trackRef.current;
    if (!el || count === 0) return;
    el.scrollTo({ left: (el.scrollWidth / count) * index, behavior: "smooth" });
  }

  return (
    <>
      <div
        ref={trackRef}
        aria-label={label}
        className={`flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scrollbar-none py-8 sm:overflow-visible sm:snap-none sm:py-10 ${gridClassName}`}
      >
        {Children.map(children, (child) => (
          <div className="w-full shrink-0 snap-center sm:w-auto sm:shrink">
            {child}
          </div>
        ))}
      </div>

      {/* Only on a phone, where the track scrolls. From sm up every card is
          already on screen and dots would point at nothing. */}
      {count > 1 && (
        <div className="flex justify-center gap-2 sm:hidden">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show item ${i + 1} of ${count}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 ${
                i === active
                  ? "w-5 bg-theme-primary"
                  : "w-2 bg-theme-border hover:bg-theme-muted"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
