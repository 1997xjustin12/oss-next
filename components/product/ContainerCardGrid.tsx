'use client'

import { useEffect, useState } from 'react'
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

  const pending = !resolved || (!useDefaults && fetched?.location !== location)
  const current = useDefaults ? defaults : fetched?.location === location ? fetched.cards : null

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-5 px-5 scroll-px-5 pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8 sm:mx-0 sm:px-0 sm:scroll-px-0 sm:pb-0 sm:overflow-visible sm:snap-none py-8 sm:py-10 w-full">
      {FEATURED_CONTAINERS.map((item) => {
        const card = pending ? defaults[item.depotSpec] : current?.[item.depotSpec]
        return (
          <div key={item.key} className="w-[75%] shrink-0 snap-start sm:w-auto sm:shrink">
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
  )
}
