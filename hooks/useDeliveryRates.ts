'use client'

import { useEffect, useState } from 'react'
import type { DeliveryRates, DeliveryRatesErrorReason } from '@/types/delivery'

/**
 * Live delivery rates for a product/ZIP pair.
 *
 * Refetches whenever either input changes — which on the PDP means both a ZIP
 * entry and an option change, since picking a different size or condition swaps
 * the active product and therefore the depot behind it.
 *
 * Only the settled response is held in state; `loading` and the empty state are
 * derived from it. That is what keeps this correct rather than merely tidy: the
 * stored response carries the lookup key it answered, so a slow reply for a
 * product the visitor has already navigated away from can be recognised and
 * dropped instead of overwriting a fresher one. Aborting alone would not catch
 * it — a response can be in flight past the abort and still land last.
 */

type Params = {
  /** Product slug — the ES `handle`, which matches the WordPress slug. */
  slug: string | undefined
  /** Destination ZIP or Canadian postal code. Empty disables the lookup. */
  zipcode: string
  /**
   * Optional destination label. Leave unset: the endpoint then resolves the
   * city from the ZIP, which measures shorter, more accurate distances than
   * the two-letter state code the legacy WordPress page sends.
   */
  state?: string
  /** Set false to hold off entirely, e.g. for a generic display listing. */
  enabled?: boolean
}

type DeliveryError = { reason: DeliveryRatesErrorReason; message: string }

type Result = {
  rates: DeliveryRates | null
  loading: boolean
  /** Set when the lookup failed. `rates` is null whenever this is set. */
  error: DeliveryError | null
}

type Settled = {
  /** The lookup this answers, so a stale reply can be told apart from a fresh one. */
  key: string
  rates: DeliveryRates | null
  error: DeliveryError | null
}

const DEBOUNCE_MS = 400

const UNAVAILABLE: DeliveryError = {
  reason: 'unavailable',
  message: 'Delivery rates are unavailable right now. Please call for the best rate.',
}

export function useDeliveryRates({ slug, zipcode, state, enabled = true }: Params): Result {
  const [settled, setSettled] = useState<Settled | null>(null)

  const trimmedZip = zipcode.trim()
  const trimmedState = state?.trim() ?? ''
  const active = enabled && !!slug && !!trimmedZip
  // Empty while inactive, so nothing can match it and no stale result shows.
  const key = active ? `${slug}|${trimmedZip}|${trimmedState}` : ''

  useEffect(() => {
    if (!active) return

    const controller = new AbortController()

    // Someone typing a ZIP produces a render per keystroke; only the last one
    // deserves a request, and upstream takes ~3s cold.
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ zipcode: trimmedZip, slug: slug as string })
      if (trimmedState) params.set('state', trimmedState)

      fetch(`/api/delivery-rates?${params.toString()}`, { signal: controller.signal })
        .then(async (res) => {
          const body = (await res.json()) as
            | { ok: true; rates: DeliveryRates }
            | ({ ok: false } & DeliveryError)

          setSettled(
            body.ok
              ? { key, rates: body.rates, error: null }
              : { key, rates: null, error: { reason: body.reason, message: body.message } },
          )
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          console.error('[useDeliveryRates]', err)
          setSettled({ key, rates: null, error: UNAVAILABLE })
        })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [active, key, slug, trimmedZip, trimmedState])

  if (!active) return { rates: null, loading: false, error: null }

  // Anything not answering the current lookup is stale — including a result
  // for the product that was selected a moment ago.
  const current = settled?.key === key ? settled : null

  return {
    rates: current?.rates ?? null,
    loading: !current,
    error: current?.error ?? null,
  }
}
