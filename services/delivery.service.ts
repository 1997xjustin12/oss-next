import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { SITE } from '@/config/site'
import { formatMoney } from '@/lib/formatters'
import { ShippingRefusedError } from '@/lib/shippingQuote'
import { getOrderTotal } from '@/services/order.service'
import { getProductByHandle } from '@/services/search.service'
import type { CartLineItem } from '@/types/cart'
import type { ProductHit } from '@/types/product'
import type { ShippingOption, ShippingQuote } from '@/types/order'
import type {
  DeliveryRates,
  DeliveryRateOption,
  DeliveryRatesResult,
} from '@/types/delivery'

/**
 * Delivery rates for one product and one destination.
 *
 * **Now served by the Django backend**, the same `api/orders/get-total` quote
 * the cart and checkout price against. It used to call WordPress
 * (`/wp-json/custom/v1/delivery-rates`), and that move is the point:
 *
 *   * WordPress was failing. Eight identical requests for ZIP 30303 on
 *     2026-09-21 returned six Cloudflare 502s; the two that answered came back
 *     `call_for_rate` with no depot and no distance, which this service cached
 *     as a success for an hour. That is why the product page showed a real
 *     price sometimes and "Call for rate" the rest of the time.
 *   * WordPress answered `distance_miles: 0` for every ZIP while still
 *     returning rates, so the summary could never show how far away the depot
 *     was. Django returns the real figure (5.75 mi for 30303, 122.65 for
 *     37402).
 *   * The product page and the cart were quoting from two different systems.
 *     A customer seeing $450 on the product page and "call for rate" at
 *     checkout is worse than either number on its own.
 *
 * The exported signature is unchanged on purpose — this file's whole job is to
 * hand callers {@link DeliveryRatesResult} whatever sits behind it, and the PDP,
 * the delivery-quote flow and the cart estimate all switched over without a
 * line of component code changing.
 *
 * ## What this costs
 *
 * Each uncached quote makes the backend call Google Distance Matrix, which is
 * billed. A depot-to-ZIP distance does not change, so the answer is cached for
 * hours (below) and the same product/ZIP pair is asked once for every visitor
 * rather than once per page view.
 */

export type DeliveryRatesQuery = {
  /** Destination ZIP or Canadian postal code. Required. */
  zipcode: string
  /** Product slug — the ES handle. Required; the backend prices real products. */
  slug?: string
  /**
   * WP post id. Accepted for backwards compatibility with the old endpoint and
   * ignored: the backend prices a catalogue line, which is found by handle.
   */
  itemId?: number
  /**
   * Destination label, accepted and ignored. WordPress needed it to resolve
   * awkward ZIPs; the backend geocodes the ZIP itself.
   */
  state?: string
}

/** Canadian postal codes start with a letter; US ZIPs do not. */
function countryForZip(zipcode: string): string {
  return /^[A-Za-z]/.test(zipcode.trim()) ? 'CA' : 'US'
}

/**
 * The id the backend expects for a cart line.
 *
 * Same rule as `cartItemsToLineItems` in lib/cart, repeated here rather than
 * imported: that module is built for the browser's cart, and this one runs on
 * the server inside a cached function.
 */
function lineProductId(hit: ProductHit): number | string {
  const raw = hit as unknown as Record<string, unknown>
  const productId = Number(raw.product_id)
  if (Number.isInteger(productId) && productId > 0) return productId
  const objectId = Number(raw.objectID)
  if (Number.isInteger(objectId) && objectId > 0) return objectId
  return String(raw.objectID ?? '')
}

/**
 * "Shipping is Additional" is a $0 placeholder meaning the rate is quoted after
 * the order. Left in the list it would sort to the front as the cheapest option
 * and the page would announce free delivery.
 */
const NOT_A_DELIVERY_PRICE = new Set(['additional', 'free_shipping'])

/** Per-method rate card, when the depot publishes one. */
function rateCard(quote: ShippingQuote, id: string): { perMile: number | null; min: number | null } {
  const depot = quote.depot as unknown as Record<string, unknown> | undefined
  const num = (value: unknown) => {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  if (id === 'tilt_bed') {
    return { perMile: num(depot?.tilt_bed_rate_per_mile), min: num(depot?.tilt_bed_min_rate) }
  }
  if (id === 'flat_bed') {
    return { perMile: num(depot?.flat_bed_rate_per_mile), min: num(depot?.flat_bed_min_rate) }
  }
  return { perMile: null, min: null }
}

function toOption(quote: ShippingQuote, option: ShippingOption): DeliveryRateOption {
  // A withheld rate keeps its price to itself. The backend still sends the
  // figure it declined to publish (it hides anything over $1,000 in favour of a
  // phone call), and printing it would undo that decision.
  const withheld = !option.available || option.hidden_reason === 'call_for_quote'
  const rate = withheld ? null : option.cost
  const card = rateCard(quote, option.id)

  return {
    key: option.id,
    label: option.plain_label || option.label,
    rate,
    rate_formatted: rate === null ? '' : formatMoney(rate),
    available: option.available,
    call_for_rate: withheld,
    rate_per_mile: card.perMile,
    min_rate: card.min,
  }
}

function toDeliveryRates(
  quote: ShippingQuote,
  product: ProductHit,
  slug: string,
  zipcode: string,
  taxRate: number | null,
): DeliveryRates {
  const options = (quote.options ?? [])
    .filter((option) => !NOT_A_DELIVERY_PRICE.has(option.id))
    .map((option) => toOption(quote, option))

  const depotTitle = quote.depot?.title ?? ''
  const trucks = Math.max(0, ...(quote.options ?? []).map((o) => Number(o.trucks) || 0))

  return {
    rates_available: quote.can_deliver !== false,
    // Our own cache, not upstream's — see getDeliveryRates.
    cached: false,
    product: {
      id: Number(lineProductId(product)) || 0,
      slug,
      title: String(product.desc_title || product.title || ''),
    },
    destination: {
      zipcode,
      label: '',
      // The backend geocodes the ZIP but does not echo the place back. The
      // quote page prefers its own Geoapify label anyway and falls back to the
      // bare ZIP, so empty is honest rather than guessed.
      city: '',
      state: '',
      country: countryForZip(zipcode),
      address: '',
    },
    depot: {
      address: String((quote.depot as unknown as Record<string, unknown>)?.address ?? ''),
      stores: depotTitle ? [depotTitle] : [],
      is_miami: /miami/i.test(depotTitle),
    },
    distance_miles: quote.distance_miles ?? null,
    duration_hours: null,
    trucks_needed: trucks || null,
    total_size: null,
    is_rent_to_own: false,
    handling_fee: 0,
    relocation_fee: 0,
    tax_rate: taxRate,
    options,
    call_for_rate: !options.some((o) => o.key !== 'pickup' && !o.call_for_rate && o.rate !== null),
    phone: SITE.telephoneDisplay,
    message: quote.need_to_call ? quote.restriction || '' : '',
    raw: null,
  }
}

const FALLBACK_MESSAGE =
  'Delivery rates are unavailable right now. Please call for the best trucking rates.'

/**
 * A fresh quote, bypassing our cache.
 *
 * The old signature took `{ refresh }` to bust WordPress's own transient as
 * well. There is no upstream cache any more, so "refresh" now means exactly
 * "call this instead of getDeliveryRates".
 */
export async function fetchDeliveryRates(
  query: DeliveryRatesQuery,
): Promise<DeliveryRatesResult> {
  const zipcode = query.zipcode?.trim()
  if (!zipcode) {
    return { ok: false, reason: 'missing-zipcode', message: 'Enter a ZIP or postal code.' }
  }

  const slug = query.slug?.trim()
  if (!slug) {
    return {
      ok: false,
      reason: 'product-not-found',
      message: 'A product is needed to quote delivery.',
    }
  }

  const found = await getProductByHandle(slug)
  if (!found?.product) {
    return { ok: false, reason: 'product-not-found', message: 'That product could not be found.' }
  }

  const product = found.product
  const item = {
    ...(product as unknown as Record<string, unknown>),
    product_id: lineProductId(product),
    quantity: 1,
  } as unknown as CartLineItem

  try {
    const total = await getOrderTotal({
      items: [item],
      shipping_zip_code: zipcode,
      shipping_country: countryForZip(zipcode),
    })

    if (!total.shipping) {
      return { ok: false, reason: 'unavailable', message: FALLBACK_MESSAGE }
    }

    // The same reply that priced delivery also prices tax for this
    // destination. Kept as a rate against the sub-total it was worked out
    // from, so the page can apply it to the quantity on screen.
    const taxable = Number(total.sub_total)
    const taxed = Number(total.total_tax)
    const taxRate =
      Number.isFinite(taxable) && Number.isFinite(taxed) && taxable > 0 && taxed > 0
        ? taxed / taxable
        : null

    return { ok: true, rates: toDeliveryRates(total.shipping, product, slug, zipcode, taxRate) }
  } catch (err) {
    // "Too far to deliver" and "we need an address" are answers, not faults:
    // they are written for the customer and stay true until the address
    // changes, so they travel with their own message.
    if (err instanceof ShippingRefusedError) {
      return {
        ok: false,
        reason: err.code === 'no_address' ? 'unresolved-zipcode' : 'undeliverable',
        message: err.message,
      }
    }
    console.error('[delivery.service] quote failed:', err)
    return { ok: false, reason: 'unavailable', message: FALLBACK_MESSAGE }
  }
}

export async function getDeliveryRates(query: DeliveryRatesQuery): Promise<DeliveryRatesResult> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  const result = await fetchDeliveryRates(query)

  // Don't let a transient outage stick around for an hour. Returning the
  // failure uncached means the next visitor re-asks; caching it would keep
  // showing "call us" long after the backend recovered. A refusal is not a
  // fault — "658 miles, limit 250" is true until the address changes — so it
  // keeps the full cache life and costs no repeat lookups.
  if (!result.ok && result.reason === 'unavailable') {
    cacheLife({ revalidate: 30, expire: 60 })
  }

  return result
}
