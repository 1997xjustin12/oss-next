'use client'

import { useEffect, useState } from 'react'
import { useStoredZip } from '@/hooks/useStoredZip'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { formatMoney } from '@/lib/formatters'
import { getCustomFieldValue } from '@/lib/pricing'
import type { FormattedContainerHit } from '@/types/product'

/** Lowest price per way to pay, already formatted ("$1,350", "$95"); missing when the depot has none. */
export type DepotStartingPrices = { buy?: string; rent?: string; rto?: string }

const PAYMENT_TYPE = { buy: 'buy', rent: 'rental', rto: 'rto' } as const

/** "$1,350", not "$1,350.00"; real cents stay ("$61.36"). */
function display(price: number): string {
  return formatMoney(price).replace(/\.00$/, '')
}

/**
 * The lowest Buy, Rent and Rent-To-Own prices at the visitor's saved depot,
 * or the national pool's ("Various North America") when they have none, for
 * copy that names a starting price (the homepage's Buy / Rent / Rent-To-Own
 * section). The same rule as the hero's container list, so the two agree.
 *
 * The page is prebuilt and the depot lives in the browser, so the prices
 * arrive after mount, from the same cached endpoint the hero's list reads
 * (/api/shipping-containers/by-location). Until then, and when the lookup
 * fails, it returns an empty object: the caller shows its own figures.
 * Follows the saved location (useStoredZip), so a ZIP entered anywhere on the
 * page updates the prices.
 */
export function useDepotStartingPrices(): DepotStartingPrices {
  const stored = useStoredZip()
  const depot = stored.depot || DEFAULT_LOCATION
  const [prices, setPrices] = useState<{ depot: string; prices: DepotStartingPrices }>({ depot: '', prices: {} })

  useEffect(() => {
    // Wait for storage to be read, or a visitor with a saved depot would fetch the national pool first.
    if (!stored.resolved) return
    // Abort a lookup a newer location has overtaken, so the old depot's answer never lands on top.
    const abort = new AbortController()
    void (async () => {
      try {
        const res = await fetch(`/api/shipping-containers/by-location?${new URLSearchParams({ location: depot })}`, { signal: abort.signal })
        if (!res.ok) return
        const { data } = (await res.json()) as { data: FormattedContainerHit[] }
        const lowest = (paymentType: string): string | undefined => {
          const list = data
            .filter((hit) => getCustomFieldValue(hit, 'payment_type') === paymentType && getCustomFieldValue(hit, 'location') === depot)
            .map((hit) => hit.sale_price)
            .filter((price) => Number.isFinite(price) && price > 0)
          return list.length ? display(Math.min(...list)) : undefined
        }
        setPrices({
          depot,
          prices: { buy: lowest(PAYMENT_TYPE.buy), rent: lowest(PAYMENT_TYPE.rent), rto: lowest(PAYMENT_TYPE.rto) },
        })
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') console.error('[useDepotStartingPrices] lookup failed — depot:', depot, err)
      }
    })()
    return () => abort.abort()
  }, [depot, stored.resolved])

  // Only the current depot's answer: a previous depot's prices are not this one's.
  return prices.depot === depot ? prices.prices : {}
}
