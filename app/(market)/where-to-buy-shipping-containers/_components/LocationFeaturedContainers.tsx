'use client'

import { useEffect } from 'react'

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

    if (!stored) {
      console.log('[LocationFeaturedContainers] no depot in localStorage yet (key: %s)', DEPOT_KEY)
      return
    }

    // Abort on unmount: without it a slow lookup resolves against a component
    // that is gone, and in StrictMode's double-mount the first request is left
    // running with nothing to do.
    const abort = new AbortController()

    void (async () => {
      try {
        const res = await fetch(
          `/api/shipping-containers/featured?depot=${encodeURIComponent(stored)}`,
          { signal: abort.signal },
        )
        if (!res.ok) {
          console.error('[LocationFeaturedContainers] request failed — depot, status:', stored, res.status)
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
        console.error('[LocationFeaturedContainers] lookup threw — depot:', stored, err)
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
