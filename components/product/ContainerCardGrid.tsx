'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FEATURED_CONTAINERS } from '@/config/featuredContainers'
import { useStoredZip } from '@/hooks/useStoredZip'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { toFeaturedCards, type FeaturedCards } from '@/lib/featuredCards'
import { ContainerCard } from './ContainerCard'

type Props = {
  /** The national reference listings, rendered into the prebuilt page. */
  defaults: FeaturedCards
}

const SPECS = FEATURED_CONTAINERS.map((item) => item.depotSpec).join(',')

/**
 * The homepage's four cards, with each image and price read from the catalogue.
 *
 * The page is prebuilt and the depot lives in the visitor's browser, so the
 * photos in the HTML are the national listings'. A visitor with no saved depot
 * needs nothing more, and makes no request; one with a saved depot gets theirs
 * after mount.
 *
 * The price waits until the depot is known, because a national figure would be
 * the wrong price for a visitor with a saved depot. A photo carries no such
 * claim, so it shows straight away and is swapped if the depot's differs. A
 * listing with no photo uses the card's own, and a depot with no such listing
 * shows no price.
 */
export function ContainerCardGrid({ defaults }: Props) {
  const { depot, resolved } = useStoredZip()
  const [fetched, setFetched] = useState<{ location: string; cards: FeaturedCards | null } | null>(null)

  const location = depot || DEFAULT_LOCATION
  // Empty defaults mean the search was down when the page was built, so ask again.
  const useDefaults = location === DEFAULT_LOCATION && Object.keys(defaults).length > 0

  useEffect(() => {
    if (!resolved || useDefaults) return

    // Also aborts a lookup a newer location has overtaken, so a slow answer for
    // the old depot can never land on top of the new one.
    const abort = new AbortController()

    void (async () => {
      try {
        const query = new URLSearchParams({ depot: location, specs: SPECS })
        const res = await fetch(`/api/shipping-containers/featured?${query}`, { signal: abort.signal })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const body = (await res.json()) as { containers: Parameters<typeof toFeaturedCards>[0] }
        setFetched({ location, cards: toFeaturedCards(body.containers) })
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return
        console.error('[ContainerCardGrid] lookup failed — depot:', location, err)
        setFetched({ location, cards: null })
      }
    })()

    return () => abort.abort()
  }, [resolved, useDefaults, location])

  // The phone carousel: which end the track is at, for greying out its buttons.
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const sync = () => {
      setAtStart(el.scrollLeft <= 1)
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
    }
    const frame = requestAnimationFrame(sync)
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])
  /** One card along: the track shows one card at a time on a phone. */
  function move(direction: 1 | -1) {
    const el = trackRef.current
    if (el) el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' })
  }

  const pending = !resolved || (!useDefaults && fetched?.location !== location)
  const current = useDefaults ? defaults : fetched?.location === location ? fetched.cards : null

  return (
    // Phone: a carousel, one card at a time, with ‹ › buttons (and swipe). From `sm`: the grid, no buttons.
    <div className="flex w-full items-center gap-2 py-6 sm:block sm:py-10">
      <CarouselButton direction={-1} disabled={atStart} onClick={() => move(-1)} />
      <div
        ref={trackRef}
        role="region"
        aria-label="Featured containers"
        // p-1 / scroll-px-1: room for a card's hover ring and lift inside the scrolling box, which clips.
        className="flex min-w-0 [scrollbar-width:none] flex-1 snap-x snap-mandatory scroll-px-1 gap-4 overflow-x-auto scroll-smooth p-1 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:p-0 sm:snap-none lg:grid-cols-4 lg:gap-8"
      >
        {FEATURED_CONTAINERS.map((item) => {
          const card = pending ? defaults[item.depotSpec] : current?.[item.depotSpec]
          return (
            <div key={item.key} className="w-full shrink-0 snap-start sm:w-auto sm:shrink">
              <ContainerCard
                item={item}
                image={card?.image || item.image}
                price={card?.price ?? null}
                pricePending={pending}
              />
            </div>
          )
        })}
      </div>
      <CarouselButton direction={1} disabled={atEnd} onClick={() => move(1)} />
    </div>
  )
}

/** A phone-only ‹ / › button (hidden from `sm`, where the cards are a grid); greyed out at its end. */
function CarouselButton({ direction, disabled, onClick }: { direction: 1 | -1; disabled: boolean; onClick: () => void }) {
  const Icon = direction === 1 ? ChevronRight : ChevronLeft
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 1 ? 'Next container' : 'Previous container'}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white shadow-md transition-colors hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary disabled:cursor-not-allowed disabled:opacity-30 sm:hidden dark:bg-white/15 dark:hover:bg-white/25 dark:focus-visible:outline-amber-400"
    >
      <Icon aria-hidden className="h-6 w-6" />
    </button>
  )
}
