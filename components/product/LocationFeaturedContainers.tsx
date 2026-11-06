'use client'

import { useEffect, useState } from 'react'
import { useStoredZip } from '@/hooks/useStoredZip'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { FeaturedContainerCard, FeaturedContainerCardSkeleton } from './FeaturedContainerCard'
import type { DepotFeaturedKey } from '@/services/search.service'
import type { ProductHit } from '@/types/product'

/** How many the lookup answers with when no `specs` are given, and so how many skeletons to show. */
const DEFAULT_SLOTS = 4

type Props = {
  /** Which containers to load, in this order: the ones the page's original features. Leave out for the default four. */
  specs?: readonly DepotFeaturedKey[]
  /** The section's vertical spacing, which each page sets for its own layout. */
  className?: string
}

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
 * The featured containers for whichever depot this visitor resolved to.
 *
 * A Client Component because the depot lives in their browser's storage, which
 * no server render can see — so the fetch happens after mount, through
 * `/api/shipping-containers/featured`.
 *
 * Follows the saved location through `useStoredZip`, so when any ZIP box on
 * the page saves a new one the cards refetch for that depot. The same specs
 * come back for every depot, keyed the same, so the titles stay put
 * and only each card's price, monthly figure and link change. The previous
 * cards stay up while the next depot's load; the skeleton is first load only.
 *
 * Renders nothing at all when the lookup finds none or fails: a heading over an
 * empty row says less than no row.
 */
export function LocationFeaturedContainers({ specs, className = 'pb-12' }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const { depot: stored, resolved } = useStoredZip()
  // A string, so a parent passing a fresh array with the same keys does not refetch.
  const specsParam = specs?.join(',')

  useEffect(() => {
    // Wait for storage to be read, or every visitor with a saved depot would
    // fetch the national pool first and then their own.
    if (!resolved) return

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
        const query = new URLSearchParams({ depot })
        if (specsParam !== undefined) query.set('specs', specsParam)

        const res = await fetch(`/api/shipping-containers/featured?${query}`, { signal: abort.signal })
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

    // Also aborts a lookup a newer location has overtaken, so a slow answer
    // for the old depot can never land on top of the new one.
    return () => abort.abort()
  }, [resolved, stored, specsParam])

  if (state.status === 'empty') return null

  return (
    <section aria-labelledby="featured-containers" className={`w-full bg-white px-[5%] dark:bg-neutral-950 ${className}`}>
      <h2 id="featured-containers" className="sr-only">
        Shipping containers available near you
      </h2>

      {/*
        `auto-rows-fr` for the same reason as the option cards: stacked in one
        column each card is its own row, and rows size to their own content, so
        the longest title would otherwise make one card taller than the rest.
      */}
      <ul
        className="grid auto-rows-fr grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4"
        // So a screen reader waits for the real cards rather than announcing
        // four placeholder rows as they appear.
        aria-busy={state.status === 'loading'}
      >
        {state.status === 'loading'
          ? Array.from({ length: specs?.length ?? DEFAULT_SLOTS }).map((_, i) => (
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
