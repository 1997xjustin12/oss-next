'use client'

import { useEffect, useState } from 'react'
import { useStoredZip } from '@/hooks/useStoredZip'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { formatMoney } from '@/lib/formatters'

/**
 * "Starts at $X" for one featured container, at the visitor's depot.
 *
 * The depot is only known in the browser (it is stored with their ZIP), so the
 * homepage card stays server-rendered and only this label is a client leaf.
 * With no stored depot it uses the generic reference listings, like the ZIP
 * banner above it. Renders nothing when the depot has no matching listing — no
 * price is better than an invented one.
 */

type Prices = Record<string, number | null>

/** One request per location, shared by all four cards. */
const requests = new Map<string, Promise<Prices | null>>()

function fetchStartingPrices(location: string): Promise<Prices | null> {
  const existing = requests.get(location)
  if (existing) return existing

  const request = fetch(`/api/shipping-containers/starting-prices?${new URLSearchParams({ location })}`)
    .then((res) => (res.ok ? (res.json() as Promise<{ prices?: Prices }>) : null))
    .then((body) => body?.prices ?? null)
    .catch(() => null)
  requests.set(location, request)
  // A failure is not remembered, so the next page view can try again.
  void request.then((prices) => {
    if (!prices) requests.delete(location)
  })
  return request
}

export function StartingPriceLabel({ cardKey }: { cardKey: string }) {
  const { depot, resolved } = useStoredZip()
  const location = depot || DEFAULT_LOCATION
  const [settled, setSettled] = useState<{ location: string; prices: Prices | null } | null>(null)

  useEffect(() => {
    if (!resolved) return
    let cancelled = false
    void fetchStartingPrices(location).then((prices) => {
      if (!cancelled) setSettled({ location, prices })
    })
    return () => {
      cancelled = true
    }
  }, [resolved, location])

  // Anything answering a different depot is stale — the visitor changed ZIP.
  const current = settled?.location === location ? settled : null
  if (!current) {
    return <span aria-hidden className="inline-block h-5 w-36 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
  }

  const price = current.prices?.[cardKey]
  if (price === null || price === undefined) return null
  return <>Starts at {formatMoney(price)}</>
}
