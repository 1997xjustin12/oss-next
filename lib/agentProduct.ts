import { SITE, absoluteUrl } from '@/config/site'
import { ROUTES } from '@/config/routes'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { getCustomFieldValue, getPriceBasis, isContainerHit } from '@/lib/pricing'
import { normaliseRating } from '@/lib/ratings'
import { resolveContainerVariant } from '@/lib/containerVariant'
import { PDP_SHIPPING_CONTAINERS } from '@/lib/data/pdpShippingContainers'
import type { ProductHit } from '@/types/product'

/**
 * The product shape the agent API returns.
 *
 * This is a published contract, so it is deliberately *not* the internal
 * `ProductHit`. That type carries Elasticsearch artefacts, a `custom_fields`
 * array that has to be searched by name, and — the dangerous one — a
 * `sale_price` whose meaning changes per product.
 *
 * ## The price field, which is the whole reason this normaliser exists
 *
 * About 8,000 of the ~10,000 products are rental or rent-to-own, and their
 * `sale_price` is a **monthly** figure. A 40ft container reads as "$232.14".
 * On a web page the surrounding design says "per month"; in a JSON field it
 * says nothing, and an assistant will quote it as the price of a container.
 *
 * So `price` is never a bare number here. It is an object that states its own
 * basis, and the field an agent is most likely to grab —
 * `price.description` — is a complete English sentence.
 */

export type AgentPrice = {
  amount: number
  currency: 'USD'
  /** `one-time` for purchase, `monthly` for rental and rent-to-own. */
  basis: 'one-time' | 'monthly'
  /** Contract length in months, when the product has one. */
  termMonths?: number
  /**
   * Unambiguous English, e.g. "$232.14 per month on a 12-month rent-to-own
   * agreement". Safe to quote verbatim; `amount` alone is not.
   */
  description: string
  /**
   * When this figure was read, ISO 8601.
   *
   * An assistant may hold a response for minutes or cache it for far longer,
   * and a stale price quoted with confidence becomes a customer-service problem
   * for the client rather than a bug for us. Stamping the read lets a consumer
   * decide whether to re-fetch, and lets us say "as of" instead of implying the
   * number is live.
   */
  asOf: string
  /** After this, re-fetch rather than quoting. ISO 8601. */
  validUntil: string
}

export type AgentProduct = {
  handle: string
  title: string
  url: string
  /** Markdown representation of this product — specs, FAQ, ordering. */
  markdownUrl: string
  sku?: string
  price: AgentPrice
  availability: 'in_stock' | 'out_of_stock'
  productType: 'container' | 'accessory'
  purchaseType?: 'buy' | 'rental' | 'rent_to_own'
  condition?: string
  grade?: string
  size?: string
  height?: string
  /** Depot this listing is stocked at. Absent when stocked broadly. */
  location?: string
  image?: string
  images?: string[]
  rating?: { value: number; count: number }
}

/** Extra detail only the single-product endpoint returns. */
export type AgentProductDetail = AgentProduct & {
  specifications?: { label: string; value: string }[]
  faq?: { question: string; answer: string }[]
  delivery?: {
    handlingTimeDays: [number, number]
    transitTimeDays: [number, number]
    note: string
  }
}

const PURCHASE_TYPE: Record<string, AgentProduct['purchaseType']> = {
  buy: 'buy',
  rental: 'rental',
  rto: 'rent_to_own',
}

function priceDescription(
  amount: number,
  basis: 'one-time' | 'monthly',
  termMonths: number | undefined,
  purchaseType: AgentProduct['purchaseType'],
): string {
  const money = `$${amount.toFixed(2)} USD`
  if (basis === 'one-time') return `${money} one-time purchase price.`

  const kind = purchaseType === 'rent_to_own' ? 'rent-to-own agreement' : 'rental'
  return termMonths
    ? `${money} per month on a ${termMonths}-month ${kind}. This is NOT the total price — the total over the full term is $${(amount * termMonths).toFixed(2)} USD.`
    : `${money} per month on a ${kind}. This is NOT the total price.`
}

/**
 * How long a quoted price should be treated as current.
 *
 * Container pricing moves with steel and freight rather than by the hour, so a
 * day is generous without being reckless. It is deliberately far shorter than
 * the JSON-LD `priceValidUntil` (a rolling year, which exists to satisfy
 * Google's structured-data requirement) — this one is a real instruction to a
 * consumer that may cache.
 */
const PRICE_VALID_HOURS = 24

export function toAgentProduct(product: ProductHit, now: Date = new Date()): AgentProduct {
  const isContainer = isContainerHit(product)
  const basis = getPriceBasis(product)
  const purchaseType = PURCHASE_TYPE[getCustomFieldValue(product, 'payment_type')]
  const location = getCustomFieldValue(product, 'location')
  const rating = normaliseRating(product.ratings)
  const amount = Number(product.sale_price) || 0

  const images = (product.images ?? []).map((i) => i.src).filter(Boolean)

  return {
    handle: product.handle,
    title: product.title,
    url: absoluteUrl(ROUTES.PRODUCT(product.handle)),
    markdownUrl: `${absoluteUrl(ROUTES.PRODUCT(product.handle))}.md`,
    ...(product.variants?.[0]?.sku ? { sku: product.variants[0].sku } : {}),
    price: {
      amount,
      currency: 'USD',
      basis: basis.period,
      ...(basis.termMonths ? { termMonths: basis.termMonths } : {}),
      description: priceDescription(amount, basis.period, basis.termMonths, purchaseType),
      asOf: now.toISOString(),
      validUntil: new Date(now.getTime() + PRICE_VALID_HOURS * 3600_000).toISOString(),
    },
    availability: 'in_stock',
    productType: isContainer ? 'container' : 'accessory',
    ...(purchaseType ? { purchaseType } : {}),
    ...(getCustomFieldValue(product, 'condition') ? { condition: getCustomFieldValue(product, 'condition') } : {}),
    ...(getCustomFieldValue(product, 'grade') ? { grade: getCustomFieldValue(product, 'grade') } : {}),
    ...(getCustomFieldValue(product, 'length_width') ? { size: getCustomFieldValue(product, 'length_width') } : {}),
    ...(getCustomFieldValue(product, 'height') ? { height: getCustomFieldValue(product, 'height') } : {}),
    ...(location && location !== DEFAULT_LOCATION ? { location } : {}),
    ...(images[0] ? { image: images[0] } : {}),
    ...(images.length ? { images } : {}),
    ...(rating.count > 0 ? { rating: { value: rating.value, count: rating.count } } : {}),
  }
}

export function toAgentProductDetail(product: ProductHit, now: Date = new Date()): AgentProductDetail {
  const base = toAgentProduct(product, now)
  if (!isContainerHit(product)) return base

  const entry = PDP_SHIPPING_CONTAINERS[resolveContainerVariant(product)]

  return {
    ...base,
    ...(entry.specs?.length ? { specifications: entry.specs } : {}),
    ...(entry.faq?.length ? { faq: entry.faq } : {}),
    delivery: {
      handlingTimeDays: [1, 2],
      transitTimeDays: [3, 5],
      note: `Delivered by truck from ${SITE.name}'s depot network. The delivery site needs roughly 12ft of width for access and clear space for a truck to manoeuvre — confirm site access before ordering.`,
    },
  }
}
