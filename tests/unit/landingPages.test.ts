// The for-sale and rental pages' structured data: the rental Product's price
// range (lib/schema.ts) and the FAQ answers as plain text (containerLandingContent.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const { aggregateOfferProductNode } = await import('@/lib/schema')
const { landingFaqText, p } = await import('@/lib/data/containerLandingContent')
const { RENTAL_FAQS } = await import('@/lib/data/rentalContent')
const { FOR_SALE_FAQS } = await import('@/lib/data/forSaleContent')

describe('aggregateOfferProductNode', () => {
  it('spans the listings’ prices, skipping unpriced ones', () => {
    const node = aggregateOfferProductNode({
      name: 'Rental',
      products: [
        { sale_price: 125, images: [{ src: 'a.webp' }] },
        { sale_price: 95, images: [{ src: 'b.webp' }] },
        { sale_price: 0 },
        { sale_price: 150, images: [{ src: 'a.webp' }] },
      ],
    })
    const offers = node?.offers as Record<string, unknown>
    assert.equal(offers.lowPrice, '95.00')
    assert.equal(offers.highPrice, '150.00')
    assert.equal(offers.offerCount, 3)
    assert.deepEqual(node?.image, ['a.webp', 'b.webp'])
  })

  it('emits nothing rather than invent a price', () => {
    assert.equal(aggregateOfferProductNode({ name: 'Rental', products: [{ sale_price: 0 }] }), null)
  })
})

describe('landingFaqText', () => {
  it('joins paragraphs, list items and link text', () => {
    const text = landingFaqText({
      question: 'Q',
      answer: [p('Call ', { text: '(888) 977-9085', href: 'tel:+18889779085' }, '.'), { ul: [['one'], ['two']] }],
    })
    assert.equal(text, 'Call (888) 977-9085. one two')
  })

  it('gives every FAQ on both pages a non-empty answer, with the sales line only', () => {
    for (const faq of [...FOR_SALE_FAQS, ...RENTAL_FAQS]) {
      const text = landingFaqText(faq)
      assert.ok(text.length > 40, faq.question)
      assert.ok(!text.includes('667-4834'), faq.question)
    }
  })
})
