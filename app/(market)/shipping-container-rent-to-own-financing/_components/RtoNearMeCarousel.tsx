'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  /** The `<li>` cards, already rendered, so they stay Server Components. */
  children: ReactNode
  label: string
}

const ARROW_CLASS = `hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white transition-colors hover:bg-black
  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary disabled:cursor-not-allowed disabled:opacity-30 sm:flex
  dark:bg-neutral-700 dark:hover:bg-neutral-600`

/**
 * A row that scrolls sideways and snaps to whole cards: swiped on a phone, with
 * arrows from `sm` up. An arrow moves a screenful of cards, and greys out at its end.
 */
export function RtoNearMeCarousel({ children, label }: Props) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const frame = requestAnimationFrame(sync)
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [sync])

  function move(direction: 1 | -1) {
    const el = trackRef.current
    if (el) el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="mt-8 flex items-center gap-3">
      <button type="button" onClick={() => move(-1)} disabled={atStart} aria-label="Previous containers" className={ARROW_CLASS}>
        <ChevronLeft aria-hidden className="h-6 w-6" />
      </button>
      <ul
        ref={trackRef}
        aria-label={label}
        // relative: the cards' screen-reader text is absolutely positioned, and would
        // otherwise widen the page from outside this scrolling box.
        className="scrollbar-none relative flex min-w-0 flex-1 snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth py-2"
      >
        {children}
      </ul>
      <button type="button" onClick={() => move(1)} disabled={atEnd} aria-label="Next containers" className={ARROW_CLASS}>
        <ChevronRight aria-hidden className="h-6 w-6" />
      </button>
    </div>
  )
}
