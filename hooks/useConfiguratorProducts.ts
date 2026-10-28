'use client'

import { useEffect, useState } from 'react'
import { useStoredZip } from '@/hooks/useStoredZip'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { isAbandonedRequest } from '@/lib/pageUnloading'
import type { ConfiguratorPaymentType, ConfiguratorProduct } from '@/lib/configurator'

export type ConfiguratorData = { location: string; products: ConfiguratorProduct[] }

export type UseConfiguratorProductsReturn = {
  /** The depot the products are for. Null until there are any. */
  location: string | null
  products: ConfiguratorProduct[]
  /** Waiting for the visitor's depot or its products. */
  loading: boolean
  /** The last fetch for the current depot failed. */
  failed: boolean
  retry: () => void
}

/**
 * The visitor's depot's products for the configurator: **one fetch per depot
 * change**, whichever ZIP box on the page made the change.
 *
 * Every ZIP box saves the location; this follows it through useStoredZip (same
 * tab and other tabs) rather than each box fetching its own copy. The server
 * renders the generic listing's products as `initial`, so a visitor with no
 * saved location costs no fetch at all.
 */
export function useConfiguratorProducts(
  paymentType: ConfiguratorPaymentType,
  initial: ConfiguratorData | null,
): UseConfiguratorProductsReturn {
  const stored = useStoredZip()
  // Null until storage has been read: before that the depot is unknown, not
  // the default.
  const depot = stored.resolved ? stored.depot || DEFAULT_LOCATION : null

  const [data, setData] = useState<ConfiguratorData | null>(initial)
  const [failedFor, setFailedFor] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const wanted = depot ?? data?.location ?? DEFAULT_LOCATION
  const current = data?.location === wanted

  useEffect(() => {
    if (!depot || data?.location === depot) return
    const controller = new AbortController()
    const params = new URLSearchParams({ location: depot, paymentType })

    fetch(`/api/shipping-containers/configurator?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as { products?: ConfiguratorProduct[] }
        setData({ location: depot, products: json.products ?? [] })
        setFailedFor(null)
      })
      .catch((err: unknown) => {
        // Superseded by a newer depot, or the visitor left: nothing failed.
        if (controller.signal.aborted || isAbandonedRequest(err)) return
        console.error('[useConfiguratorProducts] fetch failed — location:', depot, err)
        setFailedFor(depot)
      })

    return () => controller.abort()
    // `data` is read for its location only; refetching on every new list would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depot, paymentType, attempt])

  const failed = failedFor === wanted

  return {
    location: data?.location ?? null,
    products: data?.products ?? [],
    loading: !current && !failed,
    failed,
    retry: () => {
      setFailedFor(null)
      setAttempt((n) => n + 1)
    },
  }
}
