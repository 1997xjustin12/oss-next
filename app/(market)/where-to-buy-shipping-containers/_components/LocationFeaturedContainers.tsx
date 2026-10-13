'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { FeaturedContainerCard, FeaturedContainerCardSkeleton } from './FeaturedContainerCard'
import type { ProductHit } from '@/types/product'

/** Where the ZIP lookup stores the depot it resolved to. */
const DEPOT_KEY = 'zipcode_depot'

/** How many the lookup asks for, and so how many skeletons to show. */
const SLOTS = 4

type FeaturedResponse = {
  depot: string
  requested: number
  found: number
  containers: { spec: { key: string; label: string }; product: ProductHit }[]
}

type State =
  | { status: 'loading' }
  | { status: 'ready'; containers: FeaturedResponse['containers'] }
  | { status: 'empty' }

/**
 * The four containers for whichever depot this visitor resolved to.
 *
 * A Client Component because the depot lives in their browser's storage, which
 * no server render can see — so the fetch happens after mount, through
 * `/api/shipping-containers/featured`.
 *
 * Renders nothing at all when the lookup finds none or fails: a heading over an
 * empty row says less than no row.
 */
export function LocationFeaturedContainers() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let stored = ''
    try {
      stored = localStorage.getItem(DEPOT_KEY) ?? ''
    } catch {
      // Private mode or storage blocked — treated as "no depot yet".
    }

    /**
     * No stored depot means a visitor who has not given a ZIP yet, which is
     * most first visits. `DEFAULT_LOCATION` is the catalogue's own name for
     * the national pool, so they see real containers rather than an empty
     * band — and the moment they use the search above, storage fills in and
     * the next render is their depot.
     *
     * The constant rather than the string: it is the same value the listing
     * and the PDP already fall back to, and a second copy is a second thing to
     * keep right.
     */
    const depot = stored || DEFAULT_LOCATION

    // Abort on unmount: without it a slow lookup resolves against a component
    // that is gone, and in StrictMode's double-mount the first request is left
    // running with nothing to do.
    const abort = new AbortController()

    void (async () => {
      try {
        const res = await fetch(
          `/api/shipping-containers/featured?depot=${encodeURIComponent(depot)}`,
          { signal: abort.signal },
        )
        if (!res.ok) {
          console.error('[LocationFeaturedContainers] request failed — depot, status:', depot, res.status)
          setState({ status: 'empty' })
          return
        }

        const data = (await res.json()) as FeaturedResponse
        setState(
          data.containers.length > 0
            ? { status: 'ready', containers: data.containers }
            : { status: 'empty' },
        )
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return
        console.error('[LocationFeaturedContainers] lookup threw — depot:', depot, err)
        setState({ status: 'empty' })
      }
    })()

    return () => abort.abort()
  }, [])

  if (state.status === 'empty') return null

  return (
    <section aria-labelledby="featured-containers" className="w-full px-4 pb-12 sm:px-6">
      <h2 id="featured-containers" className="sr-only">
        Shipping containers available near you
      </h2>

      {/*
        `auto-rows-fr` for the same reason as the option cards: stacked in one
        column each card is its own row, and rows size to their own content, so
        the longest title would otherwise make one card taller than the rest.
      */}
      <ul
        className="container mx-auto grid auto-rows-fr grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4"
        // So a screen reader waits for the real cards rather than announcing
        // four placeholder rows as they appear.
        aria-busy={state.status === 'loading'}
      >
        {state.status === 'loading'
          ? Array.from({ length: SLOTS }).map((_, i) => (
              <li key={`skeleton-${i}`} className="flex">
                <FeaturedContainerCardSkeleton />
              </li>
            ))
          : state.containers.map(({ spec, product }) => (
              <li key={spec.key} className="flex">
                <FeaturedContainerCard product={product} />
              </li>
            ))}
      </ul>
    </section>
  )
}
