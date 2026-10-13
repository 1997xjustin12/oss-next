'use client'

import { useEffect } from 'react'
import { DEFAULT_LOCATION } from '@/lib/constants'

/** Where the ZIP lookup stores the depot it resolved to. */
const DEPOT_KEY = 'zipcode_depot'

type FeaturedResponse = {
  depot: string
  requested: number
  found: number
  containers: { spec: { key: string; label: string }; product: Record<string, unknown> }[]
}

/**
 * The four containers for whichever depot this visitor resolved to.
 *
 * A Client Component because the depot lives in their browser's storage, which
 * no server render can see — so the fetch has to happen after mount, through
 * `/api/shipping-containers/featured`.
 *
 * **Renders nothing yet.** The response is logged while the markup is agreed;
 * the data path is what is being built here.
 */
export function LocationFeaturedContainers() {
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
    if (!stored) {
      console.log('[LocationFeaturedContainers] no %s in storage — falling back to %s', DEPOT_KEY, DEFAULT_LOCATION)
    }

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
          return
        }

        const data = (await res.json()) as FeaturedResponse
        console.log('[LocationFeaturedContainers] depot:', data.depot)
        console.log(
          '[LocationFeaturedContainers] found %d of %d:',
          data.found,
          data.requested,
          data.containers.map((c) => c.spec.key),
        )
        console.log('[LocationFeaturedContainers] response:', data)
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return
        console.error('[LocationFeaturedContainers] lookup threw — depot:', depot, err)
      }
    })()

    return () => abort.abort()
  }, [])

  // Nothing on screen yet, deliberately. The depot is not held in state
  // either: it would only have fed a debug attribute, and setting state inside
  // this effect is the cascading-render pattern the lint rule forbids. The
  // console and the network tab are where this is checked until there is
  // markup to show.
  return null
}
