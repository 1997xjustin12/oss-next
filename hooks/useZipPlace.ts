'use client'

import { useEffect, useRef, useState } from 'react'
import { lookupZipGeo, type ZipGeoResult } from '@/lib/zippopotam'
import { completeZip } from '@/lib/shippingQuote'

/**
 * What a ZIP or postal code resolves to: its city, state, country and position.
 *
 * Both address forms use it for two things at once — filling City, State and
 * Country so nobody types what the ZIP already says, and giving the address
 * suggestions a place to sit near, so "123 Main St" offers the one in the
 * visitor's town rather than the first of the four hundred in the country.
 *
 * The lookup is zippopotam, which is free and unmetered. That matters: the same
 * job could be done with Geoapify, and doing it on every ZIP keystroke would
 * spend the metered quota on the one question that has a free answer. It also
 * works out the country itself — five digits is US, a letter-digit-letter code
 * is Canadian — so the form does not have to ask before it can look up.
 *
 * Cheap by construction:
 *   * nothing until the ZIP is complete (`completeZip`), so no request is made
 *     for "3", "30", "303";
 *   * 400ms after typing stops;
 *   * answers cached for the life of the tab, shared by every field using this
 *     hook — a visitor whose delivery and billing ZIP match looks it up once,
 *     and a ZIP they type back into is answered from memory;
 *   * a late answer for a ZIP that has since been edited is discarded.
 */

export type ZipPlace = ZipGeoResult

/**
 * Module-level and read during render on purpose: it is a write-once map from
 * a complete ZIP to its immutable answer, so reading it is stable across the
 * renders React may run, and it means a cached ZIP resolves with no flash of
 * "unresolved" and no state update at all.
 */
const cache = new Map<string, ZipPlace | null>()
const DEBOUNCE_MS = 400

export function useZipPlace(
  zip: string,
  country?: string,
): { place: ZipPlace | null; loading: boolean } {
  const [resolved, setResolved] = useState<{ zip: string; place: ZipPlace | null } | null>(null)
  const [loading, setLoading] = useState(false)
  // Which ZIP the newest request is for, so a slow answer for an old one is
  // dropped rather than overwriting it.
  const wanted = useRef('')

  const complete = completeZip(zip ?? '', country)
  const cached = cache.get(complete)

  useEffect(() => {
    wanted.current = complete
    if (!complete || cache.has(complete)) return

    const timer = setTimeout(async () => {
      setLoading(true)
      const result = await lookupZipGeo(complete).catch(() => null)
      cache.set(complete, result)
      if (wanted.current !== complete) return
      setResolved({ zip: complete, place: result })
      setLoading(false)
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [complete])

  if (!complete) return { place: null, loading: false }
  if (cached !== undefined) return { place: cached, loading: false }
  return {
    place: resolved?.zip === complete ? resolved.place : null,
    loading,
  }
}
