/**
 * Shapes returned by the WordPress delivery-rates endpoint.
 *
 *   GET https://onsitestorage.com/wp-json/custom/v1/delivery-rates
 *
 * A headless wrapper around the legacy `calculated_rates` admin-ajax action the
 * old single-product page fired from JS. Pricing logic stays in WordPress; this
 * app only reads the result.
 *
 * **Temporary.** This is a bridge while delivery pricing still lives in
 * WordPress. Everything here is typed from observed responses against the live
 * endpoint, not from a published schema, so treat unfamiliar fields as
 * possibly-absent rather than guaranteed.
 */

/** One delivery method and its quoted price. */
export type DeliveryRateOption = {
  /** Stable identifier — `do-tilt-bed`, `do-flat-bed`, `pick-up`. */
  key: string
  label: string
  /**
   * Quoted price, or null when there is no quotable rate. Null is common:
   * it is how both "no depot serves this route" and "over the $1,000 ceiling"
   * are expressed. Pair it with `call_for_rate` to tell a real $0 (pick-up)
   * from an absent number.
   */
  rate: number | null
  /** Upstream's own formatting, e.g. `$609.63`. Empty string when `rate` is null. */
  rate_formatted: string
  available: boolean
  call_for_rate: boolean
  rate_per_mile: number | null
  min_rate: number | null
}

export type DeliveryDestination = {
  zipcode: string
  label: string
  city: string
  state: string
  country: string
  /** e.g. `Sacramento,95814`. Empty when the depot lookup failed. */
  address: string
}

export type DeliveryDepot = {
  /** e.g. `San Francisco,CA,94607`. Empty when no depot was resolved. */
  address: string
  /** Depot names serving this product, e.g. `["Sacramento, CA"]`. */
  stores: string[]
  /** Miami has a $400 delivery floor applied upstream. */
  is_miami: boolean
}

export type DeliveryRates = {
  /**
   * Whether upstream resolved a depot and a route.
   *
   * Do **not** read this as "we have a price to show". A response can be
   * `rates_available: true` with every delivery option nulled and
   * `call_for_rate: true` — that is what a 2,910-mile route looks like, since
   * anything over $1,000 is deliberately withheld in favour of a phone call.
   * Use `hasQuotedDelivery()` for the question you actually mean.
   */
  rates_available: boolean
  /** True when upstream served this from its 6-hour transient. */
  cached: boolean
  product: {
    id: number
    slug: string
    /** Decoded — upstream sends HTML entities such as `&#8211;`. */
    title: string
  }
  destination: DeliveryDestination
  depot: DeliveryDepot
  distance_miles: number | null
  duration_hours: number | null
  trucks_needed: number | null
  /** Combined container length in feet, e.g. 40. */
  total_size: number | null
  is_rent_to_own: boolean
  handling_fee: number
  relocation_fee: number
  options: DeliveryRateOption[]
  /** Set when no delivery option can be quoted and the customer should call. */
  call_for_rate: boolean
  phone: string
  /** Customer-facing explanation. Empty string when rates were quoted. */
  message: string
  /** Upstream's unnormalised calculation inputs. Debugging only — do not render. */
  raw: Record<string, unknown> | null
}

/**
 * Why a lookup produced no rates.
 *
 * Each maps to a distinct upstream failure, because they need different
 * responses from the UI: a bad ZIP is the customer's to correct, while a
 * missing product or a dead endpoint is ours and should not be blamed on them.
 */
export type DeliveryRatesErrorReason =
  /** No ZIP supplied (400). Caller's bug — the UI should not have asked. */
  | 'missing-zipcode'
  /** Slug or item_id matched no WP product (404). */
  | 'product-not-found'
  /** ZIP could not be resolved to a location (422). Upstream suggests a `state`. */
  | 'unresolved-zipcode'
  /** Upstream errored, timed out, or returned something unreadable. */
  | 'unavailable'

/**
 * Result of a delivery-rate lookup.
 *
 * A discriminated union rather than throw-on-failure: this runs on every ZIP
 * and option change on the PDP, where an unreachable WordPress must degrade to
 * "call us for a rate", never to a broken product page.
 */
export type DeliveryRatesResult =
  | { ok: true; rates: DeliveryRates }
  | { ok: false; reason: DeliveryRatesErrorReason; message: string }
