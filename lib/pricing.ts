import type { ShippingContainerHit, FormattedContainerHit } from '@/types/product'
import { SHIPPING_CONTAINER_CATEGORIES, DEFAULT_LOCATION } from '@/lib/constants'

type CustomField = { name: string; value: string }
type ContainerVariant = { price?: string }
type ProductCategoryRef = { category_name: string }

// term (months) -> height key -> size (ft) -> monthly price
const RENTAL_PRICE_TABLE: Record<number, Record<'DV' | 'HC', Record<number, number>>> = {
  3:  { DV: { 20: 150, 40: 175 }, HC: { 40: 195 } },
  6:  { DV: { 20: 125, 40: 150 }, HC: { 40: 175 } },
  12: { DV: { 20: 95,  40: 125 }, HC: { 40: 150 } },
}

// term (months) -> divisor applied to base price
const RTO_DIVISOR_TABLE: Record<number, number> = {
  12: 8.4,
  24: 13.4,
  36: 18,
  48: 22,
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export type ProductPriceInput = {
  price:       string | number
  paymentType: string
  paymentTerm: string | string[] | undefined
  size:        string
  height:      string
}

// Direct port of the WordPress calculate_product_price() PHP function.
export function calculateProductPrice(input: ProductPriceInput): number {
  const basePrice =
    typeof input.price === 'number'
      ? input.price
      : parseFloat(String(input.price).replace(/,/g, '')) || 0

  // ES stores payment_term as a stringified list literal, e.g. "['12']", not a plain number —
  // pull out the first number rather than stripping all digits, in case a list ever has >1 entry
  const rawTerm = Array.isArray(input.paymentTerm) ? input.paymentTerm[0] : input.paymentTerm
  const term = Number(String(rawTerm ?? '').match(/\d+/)?.[0] ?? '')

  if (input.paymentType === 'rto') {
    const divisor = RTO_DIVISOR_TABLE[term]
    if (divisor) return round2(basePrice / divisor)
  }

  if (input.paymentType === 'rental') {
    const size = Number(String(input.size).replace(/[^0-9]/g, ''))
    const heightKey: 'DV' | 'HC' = input.height?.includes('Standard') ? 'DV' : 'HC'
    const rentalPrice = RENTAL_PRICE_TABLE[term]?.[heightKey]?.[size]
    if (rentalPrice !== undefined) return round2(rentalPrice)
  }

  return round2(basePrice)
}

/**
 * What a product's `sale_price` actually means.
 *
 * This is the single most dangerous ambiguity in the catalog for a machine
 * consumer. Roughly 8,000 of the ~10,000 products are rental or rent-to-own,
 * and their `sale_price` is a **monthly** figure — so a 40ft container reads as
 * "$232.14" where the buy-outright equivalent is several thousand. A human sees
 * the surrounding "per month" in the page design; a feed, a JSON-LD `offers`
 * block or a Markdown table has no design to lean on, and an assistant will
 * quote the number as the price of the container.
 *
 * Every machine-facing surface (Merchant feed, JSON-LD, agent API, Markdown)
 * must describe price through this, never by printing `sale_price` bare.
 */
export type PriceBasis = {
  /** 'one-time' for purchase, 'monthly' for rental and rent-to-own. */
  period: 'one-time' | 'monthly'
  /** Human label, e.g. "Monthly rent-to-own payment". */
  label: string
  /** Suffix for a rendered amount, e.g. "/month". Empty for one-time. */
  suffix: string
  /** Contract length in months, when the product carries one. */
  termMonths?: number
}

export function getPriceBasis(hit: ShippingContainerHit): PriceBasis {
  const paymentType = getCustomFieldValue(hit, 'payment_type')
  const termMonths = Number(getCustomFieldValue(hit, 'payment_term').match(/\d+/)?.[0] ?? '') || undefined

  if (paymentType === 'rental') {
    return { period: 'monthly', label: 'Monthly rental', suffix: '/month', termMonths }
  }
  if (paymentType === 'rto') {
    return { period: 'monthly', label: 'Monthly rent-to-own payment', suffix: '/month', termMonths }
  }
  return { period: 'one-time', label: 'Price', suffix: '' }
}

export function getCustomFieldValue(hit: ShippingContainerHit, name: string): string {
  const fields = hit.custom_fields as CustomField[] | undefined
  return fields?.find((f) => f.name === name)?.value ?? ''
}

// Single source of truth for "is this a shipping container or an accessory"
// — used both for pricing (below) and for picking which PDP component to
// render (ProductVariantShell vs AccessoryDetail).
export function isContainerHit(hit: ShippingContainerHit): boolean {
  const categories = (hit.product_category as ProductCategoryRef[] | undefined)?.map((c) => c.category_name) ?? []
  return categories.some((name) => SHIPPING_CONTAINER_CATEGORIES.includes(name))
}

// "Generic Product Page" is a template listing with no real depot behind it
// (location is the generic DEFAULT_LOCATION placeholder, not an actual
// depot) — not meant to be purchasable. Checked both by category and by
// location since either one alone can indicate a generic/display-only page.
export function isGenericDisplayHit(hit: ShippingContainerHit): boolean {
  const categories = (hit.product_category as ProductCategoryRef[] | undefined)?.map((c) => c.category_name) ?? []
  const location = getCustomFieldValue(hit, 'location')
  return categories.includes('Generic Product Page') || location === DEFAULT_LOCATION
}

// Reads the first variant's qty — undefined/null (field simply not populated
// on this hit) defaults to true (in stock) rather than a false "Out of
// Stock", since a missing field is far more likely than a genuinely
// sold-out product across this site's real catalog. Only an explicit 0
// counts as out of stock.
export function isInStockHit(hit: ShippingContainerHit): boolean {
  const variants = hit.variants as { qty?: number }[] | undefined
  const qty = variants?.[0]?.qty
  return qty === undefined || qty === null || qty > 0
}

// Single place to inject computed/derived properties onto a raw ES hit before
// it reaches any route handler or component — sale_price is guaranteed
// present on the result.
export function formatProduct(hit: ShippingContainerHit): FormattedContainerHit {
  const isContainer = isContainerHit(hit)
  const rawPrice = (hit.variants as ContainerVariant[] | undefined)?.[0]?.price ?? '0'

  if (!isContainer) {
    return { ...hit, sale_price: round2(parseFloat(String(rawPrice).replace(/,/g, '')) || 0) }
  }

  const sale_price = calculateProductPrice({
    price:       rawPrice,
    paymentType: getCustomFieldValue(hit, 'payment_type'),
    paymentTerm: getCustomFieldValue(hit, 'payment_term'),
    size:        getCustomFieldValue(hit, 'length_width'),
    height:      getCustomFieldValue(hit, 'height'),
  })

  return { ...hit, sale_price }
}

// The dimensions that identify "the same container" independent of where
// it's stocked — every container document at a given location is really
// just this same combination re-indexed per depot (see getProductByHandle's
// related_products in services/search.service.ts for the location-scoped
// counterpart of this family-of-documents model).
const EQUIVALENCE_FIELDS = ['payment_type', 'payment_term', 'length_width', 'height', 'grade', 'condition'] as const

// Given a pool of containers already scoped to a target location (e.g.
// useGeoapify's `depotContainers`), find the one that's the same container
// as `product` in every dimension except location. Returns undefined if
// that depot doesn't stock this exact combination.
export function findEquivalentContainer<T extends ShippingContainerHit>(
  pool: T[],
  product: ShippingContainerHit,
): T | undefined {
  return pool.find((candidate) =>
    EQUIVALENCE_FIELDS.every((field) => getCustomFieldValue(candidate, field) === getCustomFieldValue(product, field)),
  )
}
