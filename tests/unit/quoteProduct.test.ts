// A catalogue product in the terms the delivery quote page uses (lib/quoteProduct.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { SHIPPING_CONTAINER_CATEGORIES } from '@/lib/constants'
import { toQuoteProduct } from '@/lib/quoteProduct'
import type { ProductHit } from '@/types/product'

const product = (paymentType: string, term: string, overrides: Record<string, unknown> = {}) =>
  ({
    objectID: '1',
    title: 'Raw title || with two names',
    desc_title: 'Used WWT 20ft Shipping Container',
    sale_price: 95,
    images: [{ src: 'https://cdn.example/photo.webp' }],
    product_category: [{ category_name: 'Accessories' }],
    custom_fields: [
      { name: 'payment_type', value: paymentType },
      { name: 'payment_term', value: term },
    ],
    ...overrides,
  }) as unknown as ProductHit

/** The same product, filed as a shipping container. */
const container = (paymentType: string, term: string, overrides: Record<string, unknown> = {}) =>
  product(paymentType, term, {
    product_category: [{ category_name: SHIPPING_CONTAINER_CATEGORIES[0] }],
    ...overrides,
  })

describe('toQuoteProduct', () => {
  it('reads a purchase as a plain price', () => {
    const quote = toQuoteProduct(container('buy', '[]', { sale_price: 1699 }))
    assert.equal(quote.unitPrice, 1699)
    assert.equal(quote.priceSuffix, '')
    assert.equal(quote.label, 'Container')
  })

  it('reads a rental as a monthly payment, with its term', () => {
    const quote = toQuoteProduct(container('rental', "['12']"))
    assert.equal(quote.unitPrice, 95)
    assert.equal(quote.priceSuffix, '/mo')
    assert.equal(quote.label, 'Container (rental, 12 months)')
  })

  it('reads rent-to-own as a monthly payment, with its term', () => {
    const quote = toQuoteProduct(container('rto', "['48']", { sale_price: 77.23 }))
    assert.equal(quote.unitPrice, 77.23)
    assert.equal(quote.priceSuffix, '/mo')
    assert.equal(quote.label, 'Container (rent-to-own, 48 months)')
  })

  it('leaves the term out when the listing has none', () => {
    assert.equal(toQuoteProduct(container('rto', '[]')).label, 'Container (rent-to-own)')
  })

  it('calls an accessory an accessory, and never gives it a container photo', () => {
    const quote = toQuoteProduct(product('buy', '[]', { sale_price: 15598.7 }))
    assert.equal(quote.label, 'Accessory')
    assert.equal(quote.image, 'https://cdn.example/photo.webp')
    assert.equal(quote.priceSuffix, '')
  })

  it('prefers the clean title, and falls back to the raw one', () => {
    assert.equal(toQuoteProduct(product('buy', '[]')).title, 'Used WWT 20ft Shipping Container')
    assert.equal(toQuoteProduct(product('buy', '[]', { desc_title: '' })).title, 'Raw title || with two names')
  })

  it('uses the listing photo for a product with no curated set, and null when it has none', () => {
    assert.equal(toQuoteProduct(product('buy', '[]')).image, 'https://cdn.example/photo.webp')
    assert.equal(toQuoteProduct(product('buy', '[]', { images: [] })).image, null)
  })

  it('treats a missing or zero price as unpriced', () => {
    assert.equal(toQuoteProduct(product('buy', '[]', { sale_price: 0 })).unitPrice, 0)
    assert.equal(toQuoteProduct(product('buy', '[]', { sale_price: undefined })).unitPrice, 0)
  })
})
