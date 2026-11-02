// The Google Merchant feeds (lib/merchantFeed.ts): what stays as WordPress published
// it, what comes from the catalog, and what goes in which of the three feeds.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildMerchantFeeds, type MerchantBaseline } from '@/lib/merchantFeed'
import type { FormattedContainerHit } from '@/types/product'

const ORIGIN = 'https://onsitestorage.com'

function hit(fields: {
  id: number
  handle?: string
  type?: string
  price?: number
  sku?: string
  title?: string
  image?: string
  keyphrase?: string
  location?: string
  body?: string
  category?: string
}): FormattedContainerHit {
  return {
    product_id: fields.id,
    handle: fields.handle ?? `product-${fields.id}`,
    title: fields.title ?? `Container ${fields.id}`,
    sale_price: fields.price ?? 100,
    images: fields.image === '' ? [] : [{ src: fields.image ?? 'https://cdn.example.com/catalog.webp' }],
    variants: [{ sku: fields.sku ?? `SKU${fields.id}`, qty: 5 }],
    product_category: [{ category_name: fields.category ?? 'Shipping Containers' }],
    seo: fields.keyphrase ? { focus_keyphrase: fields.keyphrase } : undefined,
    body_html: fields.body ?? '',
    custom_fields: [
      { name: 'payment_type', value: fields.type ?? 'buy' },
      { name: 'condition', value: 'Used' },
      { name: 'grade', value: 'Wind and Water tight (WWT)' },
      { name: 'length_width', value: "40'" },
      { name: 'height', value: '9’ 6” High Cube (HC)' },
      { name: 'location', value: fields.location ?? 'Temecula, CA' },
      { name: 'payment_term', value: "['12']" },
    ],
  } as unknown as FormattedContainerHit
}

const row = (fields: Partial<MerchantBaseline[string]> = {}) => ({
  i: '1324382',
  t: 'Live Title',
  d: 'Live &quot;description&quot;',
  m: 'https://cdn.example.com/live.webp',
  g: '',
  ...fields,
})

describe('buildMerchantFeeds', () => {
  it('splits by payment type, accessories under buy', () => {
    const feeds = buildMerchantFeeds(
      [hit({ id: 1 }), hit({ id: 2, category: 'Accessories' }), hit({ id: 3, type: 'rental' }), hit({ id: 4, type: 'rto' })],
      {},
      ORIGIN,
    )
    assert.equal(feeds.buy.items, 2)
    assert.equal(feeds.rental.items, 1)
    assert.equal(feeds['rent-to-own'].items, 1)
  })

  it('keeps the live ID, title, description and image, but today’s price and link', () => {
    const { xml, added } = buildMerchantFeeds([hit({ id: 1, handle: 'h', price: 1099.5 })], { 1: row() }, ORIGIN).buy
    assert.match(xml, /<g:id>1324382<\/g:id>/)
    assert.match(xml, /<g:title>Live Title<\/g:title>/)
    // Already escaped in the baseline: must not be escaped twice.
    assert.match(xml, /<g:description>Live &quot;description&quot;<\/g:description>/)
    assert.match(xml, /<g:image_link>https:\/\/cdn\.example\.com\/live\.webp<\/g:image_link>/)
    assert.match(xml, /<g:price>1099\.50 USD<\/g:price>/)
    assert.match(xml, /<g:link>https:\/\/onsitestorage\.com\/product\/h<\/g:link>/)
    assert.equal(added, 0)
  })

  it('gives a new product its SKU as ID, never its catalog number', () => {
    const { xml, added } = buildMerchantFeeds([hit({ id: 7, sku: 'U40HC', type: 'rental', keyphrase: 'temecula storage unit' })], {}, ORIGIN).rental
    assert.match(xml, /<g:id>U40HC<\/g:id>/)
    assert.match(xml, /<g:title>Temecula Storage Unit: Used WWT 40 Ft High Cube Shipping Container For Rent<\/g:title>/)
    assert.equal(added, 1)
  })

  it('titles a new container by its city when it has no keyphrase', () => {
    const { xml } = buildMerchantFeeds([hit({ id: 7, type: 'rto', location: 'Marietta, GA' })], {}, ORIGIN)['rent-to-own']
    assert.match(xml, /<g:title>Used WWT 40 Ft High Cube Shipping Container For RTO In Marietta, GA<\/g:title>/)
  })

  it('fills in the city a live title lost', () => {
    const { xml, titlesRepaired } = buildMerchantFeeds(
      [hit({ id: 1, location: 'Round Rock, TX' })],
      { 1: row({ t: '40ft Used For Sale In : Used 40 Ft For Sale' }) },
      ORIGIN,
    ).buy
    assert.match(xml, /<g:title>40ft Used For Sale In Round Rock, TX: Used 40 Ft For Sale<\/g:title>/)
    assert.equal(titlesRepaired, 1)
  })

  it('gives a blank live title the catalog’s', () => {
    const { xml } = buildMerchantFeeds([hit({ id: 1, title: 'Corner Castings', category: 'Accessories' })], { 1: row({ t: '' }) }, ORIGIN).buy
    assert.match(xml, /<g:title>[^<]+<\/g:title>/)
  })

  it('states the GTIN when it has one, and that it has none otherwise', () => {
    const feeds = buildMerchantFeeds([hit({ id: 1 }), hit({ id: 2 })], { 1: row({ g: '616833101113' }), 2: row({ i: '2' }) }, ORIGIN)
    const [first, second] = feeds.buy.xml.split('<item>').slice(1)
    assert.match(first, /<g:gtin>616833101113<\/g:gtin>/)
    assert.doesNotMatch(first, /identifier_exists/)
    assert.match(second, /<g:identifier_exists>no<\/g:identifier_exists>/)
  })

  it('keeps a generic page already in Merchant, and leaves out a new one', () => {
    const generic = { location: 'Various North America' }
    const { items, skipped } = buildMerchantFeeds([hit({ id: 1, ...generic }), hit({ id: 2, ...generic })], { 1: row() }, ORIGIN).buy
    assert.equal(items, 1)
    assert.deepEqual(skipped, { 'generic page': 1 })
  })

  it('leaves out what cannot be an offer, and counts why', () => {
    const { items, skipped } = buildMerchantFeeds([hit({ id: 1, price: 0 }), hit({ id: 2, image: '' })], {}, ORIGIN).buy
    assert.equal(items, 0)
    assert.deepEqual(skipped, { 'no price': 1, 'no image': 1 })
  })

  it('escapes catalog text', () => {
    const { xml } = buildMerchantFeeds([hit({ id: 1, title: 'A & B <C>', category: 'Accessories' })], {}, ORIGIN).buy
    assert.doesNotMatch(xml.replace(/<\/?[a-z:]+( [^>]*)?>/g, ''), /<C>/)
    assert.match(xml, /A &amp; B &lt;C&gt;/)
  })
})
