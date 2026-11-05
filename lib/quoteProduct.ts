import { getContainerImages } from '@/lib/containerImages'
import { getCustomFieldValue, isContainerHit } from '@/lib/pricing'
import type { ProductHit } from '@/types/product'

/** The product details a delivery quote shows, read from the catalogue. */
export type QuoteProduct = {
  title: string
  image: string | null
  /** What one unit costs: the purchase price, or the monthly payment. Zero when unpriced. */
  unitPrice: number
  /** `/mo` when `unitPrice` is monthly, so it cannot be read as the container's price. */
  priceSuffix: string
  /** The container's line on the quote. */
  label: string
}

/**
 * A catalogue product in the terms the quote page uses.
 *
 * `sale_price` is the figure the product page shows: the purchase price, or the
 * monthly payment on a rental or rent-to-own listing. The title and photo follow
 * the product page too, so the quote names the same container the visitor was
 * just looking at. `payment_term` is stored as a text list such as `['12']`.
 */
export function toQuoteProduct(product: ProductHit): QuoteProduct {
  const paymentType = getCustomFieldValue(product, 'payment_type').toLowerCase()
  const monthly = paymentType === 'rental' || paymentType === 'rto'
  const term = getCustomFieldValue(product, 'payment_term').match(/\d+/)?.[0]
  const terms = term ? `, ${term} months` : ''

  const isContainer = isContainerHit(product)
  const label = !isContainer
    ? 'Accessory'
    : paymentType === 'rto'
      ? `Container (rent-to-own${terms})`
      : paymentType === 'rental'
        ? `Container (rental${terms})`
        : 'Container'

  // Guarded because the spec lookup falls back to a container's specs for a
  // product carrying none, which would give an accessory a container's photo.
  const curated = isContainer ? getContainerImages(product) : []
  const price = Number(product.sale_price)

  return {
    title: String(product.desc_title || product.title || ''),
    image: curated[0] ?? product.images?.[0]?.src ?? null,
    unitPrice: price > 0 ? price : 0,
    priceSuffix: monthly ? '/mo' : '',
    label,
  }
}
