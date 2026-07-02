import type { ShippingContainerHit, FormattedContainerHit } from '@/types/product'
import { SHIPPING_CONTAINER_CATEGORIES } from '@/lib/constants'

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

export function getCustomFieldValue(hit: ShippingContainerHit, name: string): string {
  const fields = hit.custom_fields as CustomField[] | undefined
  return fields?.find((f) => f.name === name)?.value ?? ''
}

// Single place to inject computed/derived properties onto a raw ES hit before
// it reaches any route handler or component — sale_price is guaranteed
// present on the result.
export function formatProduct(hit: ShippingContainerHit): FormattedContainerHit {
  const categories = (hit.product_category as ProductCategoryRef[] | undefined)?.map((c) => c.category_name) ?? []
  const isContainer = categories.some((name) => SHIPPING_CONTAINER_CATEGORIES.includes(name))
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
