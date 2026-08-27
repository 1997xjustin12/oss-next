import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import type {
  DeliveryRates,
  DeliveryRateOption,
  DeliveryRatesResult,
  DeliveryRatesErrorReason,
} from '@/types/delivery'

/**
 * Delivery rates, still served by WordPress.
 *
 * **Temporary bridge.** Delivery pricing has not moved to the Django backend
 * yet, so the PDP asks WordPress directly. The endpoint is a headless version
 * of the `calculated_rates` admin-ajax action the old product page fired from
 * JS, and it applies the same two rules that page applied client-side: a $400
 * floor for Miami, and rates above $1,000 withheld as `call_for_rate`.
 *
 * When pricing moves, replace the fetch below and keep the exported signature —
 * everything upstream of this file consumes {@link DeliveryRatesResult}, not
 * WordPress's shape.
 */

const WP_ORIGIN = 'https://onsitestorage.com'
const DELIVERY_RATES_URL = `${WP_ORIGIN}/wp-json/custom/v1/delivery-rates`

/**
 * Upstream answers in ~3s cold and ~1s warm, and the PDP calls this on every
 * ZIP and option change. Ten seconds is generous enough to survive a cold
 * transient while still failing before a visitor concludes the page is broken.
 */
const TIMEOUT_MS = 10_000

export type DeliveryRatesQuery = {
  /** Destination ZIP or Canadian postal code. Required. */
  zipcode: string
  /** Product slug. Required unless `itemId` is given. */
  slug?: string
  /**
   * WP post id. Takes precedence over `slug` upstream and skips the slug
   * lookup, so prefer it when a previous response already echoed one back.
   */
  itemId?: number
  /**
   * Destination label forwarded to the legacy AJAX action. Defaults upstream to
   * the city resolved from the ZIP — supply it only to recover from a
   * `unresolved-zipcode` failure.
   */
  state?: string
}

/** Decodes the numeric and named HTML entities WordPress puts in post titles. */
function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function toNumber(value: unknown): number {
  return toNumberOrNull(value) ?? 0
}

function normaliseOption(raw: Record<string, unknown>): DeliveryRateOption {
  return {
    key: String(raw.key ?? ''),
    label: String(raw.label ?? ''),
    rate: toNumberOrNull(raw.rate),
    rate_formatted: String(raw.rate_formatted ?? ''),
    available: raw.available === true,
    call_for_rate: raw.call_for_rate === true,
    rate_per_mile: toNumberOrNull(raw.rate_per_mile),
    min_rate: toNumberOrNull(raw.min_rate),
  }
}

/**
 * Coerces the upstream payload into {@link DeliveryRates}.
 *
 * Defensive on every field. This is a WordPress endpoint typed from observed
 * responses rather than a published schema, and numeric fields already arrive
 * inconsistently — `tilt_bed_rate_per_mile` is the string `"7"` while
 * `distance` is the number `87.09`.
 */
function normalise(payload: Record<string, unknown>): DeliveryRates {
  const product = (payload.product ?? {}) as Record<string, unknown>
  const destination = (payload.destination ?? {}) as Record<string, unknown>
  const depot = (payload.depot ?? {}) as Record<string, unknown>
  const options = Array.isArray(payload.options) ? payload.options : []

  return {
    rates_available: payload.rates_available === true,
    cached: payload.cached === true,
    product: {
      id: toNumber(product.id),
      slug: String(product.slug ?? ''),
      title: decodeEntities(String(product.title ?? '')),
    },
    destination: {
      zipcode: String(destination.zipcode ?? ''),
      label: String(destination.label ?? ''),
      city: String(destination.city ?? ''),
      state: String(destination.state ?? ''),
      country: String(destination.country ?? ''),
      address: String(destination.address ?? ''),
    },
    depot: {
      address: String(depot.address ?? ''),
      stores: Array.isArray(depot.stores) ? depot.stores.map(String) : [],
      is_miami: depot.is_miami === true,
    },
    distance_miles: toNumberOrNull(payload.distance_miles),
    duration_hours: toNumberOrNull(payload.duration_hours),
    trucks_needed: toNumberOrNull(payload.trucks_needed),
    total_size: toNumberOrNull(payload.total_size),
    is_rent_to_own: payload.is_rent_to_own === true,
    handling_fee: toNumber(payload.handling_fee),
    relocation_fee: toNumber(payload.relocation_fee),
    options: options.map((o) => normaliseOption((o ?? {}) as Record<string, unknown>)),
    call_for_rate: payload.call_for_rate === true,
    phone: String(payload.phone ?? ''),
    message: String(payload.message ?? ''),
    raw: (payload.raw as Record<string, unknown> | null) ?? null,
  }
}

/** Maps an upstream HTTP status onto the reason the caller can act on. */
function reasonForStatus(status: number): DeliveryRatesErrorReason {
  if (status === 400) return 'missing-zipcode'
  if (status === 404) return 'product-not-found'
  if (status === 422) return 'unresolved-zipcode'
  return 'unavailable'
}

const FALLBACK_MESSAGE =
  'Delivery rates are unavailable for this location. Please call for the best trucking rates.'

/**
 * Fetches delivery rates from WordPress. Never throws.
 *
 * Bypasses every cache — both ours and upstream's 6-hour transient. Prefer
 * {@link getDeliveryRates}, which caches; reach for this only when a caller
 * genuinely needs a fresh calculation.
 */
export async function fetchDeliveryRates(
  query: DeliveryRatesQuery,
  options: { refresh?: boolean } = {},
): Promise<DeliveryRatesResult> {
  const zipcode = query.zipcode?.trim()
  if (!zipcode) {
    return { ok: false, reason: 'missing-zipcode', message: 'Enter a ZIP or postal code.' }
  }
  if (!query.slug && !query.itemId) {
    return { ok: false, reason: 'product-not-found', message: 'No product supplied.' }
  }

  const params = new URLSearchParams({ zipcode })
  // item_id wins upstream, so send only one and keep the request honest about
  // which lookup it intends.
  if (query.itemId) params.set('item_id', String(query.itemId))
  else if (query.slug) params.set('slug', query.slug)
  if (query.state?.trim()) params.set('state', query.state.trim())
  if (options.refresh) params.set('refresh', '1')

  try {
    const res = await fetch(`${DELIVERY_RATES_URL}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    })

    if (!res.ok) {
      const reason = reasonForStatus(res.status)
      // Upstream sends a usable sentence on 404/422; anything else is a WP
      // error page we should not put in front of a customer.
      let message = FALLBACK_MESSAGE
      if (reason === 'product-not-found' || reason === 'unresolved-zipcode') {
        const body = (await res.json().catch(() => null)) as { message?: unknown } | null
        if (typeof body?.message === 'string' && body.message) message = body.message
      }
      return { ok: false, reason, message }
    }

    const payload = (await res.json()) as unknown
    if (!payload || typeof payload !== 'object') {
      return { ok: false, reason: 'unavailable', message: FALLBACK_MESSAGE }
    }

    return { ok: true, rates: normalise(payload as Record<string, unknown>) }
  } catch (err) {
    // Timeout, DNS, Cloudflare 5xx — all the same to a customer waiting on a
    // number, and all recoverable by phone.
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[delivery.service] delivery-rates failed:', detail)
    return { ok: false, reason: 'unavailable', message: FALLBACK_MESSAGE }
  }
}

/**
 * Cached delivery rates for a ZIP/product pair.
 *
 * Worth caching despite upstream's own 6-hour transient: that transient only
 * saves WordPress the calculation, while this saves the whole ~3s round trip,
 * and the same depot/ZIP pairs recur constantly across visitors.
 *
 * Tagged with PRODUCTS so the admin Cache screen's product purge reaches it —
 * rates move when depot coverage or pricing moves, which is the same event that
 * makes an admin reach for that button.
 */
export async function getDeliveryRates(query: DeliveryRatesQuery): Promise<DeliveryRatesResult> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  const result = await fetchDeliveryRates(query)

  // Don't let a transient outage stick around for an hour. Returning the
  // failure uncached means the next visitor re-asks; caching it would keep
  // showing "call us" long after WordPress recovered.
  if (!result.ok && result.reason === 'unavailable') {
    cacheLife({ revalidate: 30, expire: 60 })
  }

  return result
}
