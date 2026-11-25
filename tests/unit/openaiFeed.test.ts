// The ChatGPT product feed (lib/openaiFeed.ts): OpenAI's field names, the
// rules that differ from the Google feed (unique ids), and the Parquet file.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parquetMetadata, parquetReadObjects } from 'hyparquet'
import { SHIPPING_CONTAINER_CATEGORIES } from '@/lib/constants'
import { buildOpenAiFeedItems, toParquet } from '@/lib/openaiFeed'
import type { FormattedContainerHit } from '@/types/product'

const ORIGIN = 'https://onsitestorage.com'

const hit = (overrides: Record<string, unknown>, fields: [string, string][] = []) =>
  ({
    handle: 'used-20ft-roswell-ga',
    title: 'Used 20ft || Cargo Worthy',
    sale_price: 2299,
    images: [{ src: 'https://cdn.example/a.webp' }, { src: 'https://cdn.example/b.webp' }],
    product_category: [{ category_name: SHIPPING_CONTAINER_CATEGORIES[0] }],
    variants: [{ sku: 'U20CWRWGABUY', qty: 2 }],
    custom_fields: fields.map(([name, value]) => ({ name, value })),
    ...overrides,
  }) as unknown as FormattedContainerHit

const purchase = hit({}, [['payment_type', 'buy'], ['condition', 'Used']])
const rentToOwn = hit({ handle: 'rto-40ft', sale_price: 160.37, images: [{ src: 'https://cdn.example/c.webp' }], variants: [{ sku: 'RTO24' }] }, [
  ['payment_type', 'rto'],
  ['payment_term', "['24']"],
  ['condition', 'Used'],
])

describe('buildOpenAiFeedItems', () => {
  it('writes a purchase listing in OpenAI field names', () => {
    const [item] = buildOpenAiFeedItems([purchase])
    assert.deepEqual(item, {
      item_id: 'U20CWRWGABUY',
      title: 'Used 20ft — Cargo Worthy',
      description: 'Used 20ft — Cargo Worthy. Used.',
      url: `${ORIGIN}/product/used-20ft-roswell-ga`,
      brand: 'On-Site Storage Solutions',
      seller_name: 'On-Site Storage Solutions',
      seller_url: ORIGIN,
      image_url: 'https://cdn.example/a.webp',
      additional_image_urls: ['https://cdn.example/b.webp'],
      availability: 'in_stock',
      price: '2299.00 USD',
      condition: 'used',
      product_category: SHIPPING_CONTAINER_CATEGORIES[0],
      target_countries: ['US'],
      store_country: 'US',
      is_eligible_search: true,
      is_eligible_checkout: false,
    })
  })

  it('includes rental and rent-to-own listings, labelled monthly in title and description', () => {
    const items = buildOpenAiFeedItems([purchase, rentToOwn])
    assert.deepEqual(items.map((i) => i.item_id), ['U20CWRWGABUY', 'RTO24'])
    assert.equal(items[1].price, '160.37 USD')
    assert.match(items[1].title, /Rent-to-Own \(monthly\)$/)
    assert.match(items[1].description, /PER MONTH .* 24-month term; 3848\.88 USD over the full term\./)
  })

  it('sends each item_id once, keeping the first', () => {
    const twin = hit({ handle: 'used-20ft-roswell-ga-dup' }, [['payment_type', 'buy']])
    const items = buildOpenAiFeedItems([purchase, twin])
    assert.equal(items.length, 1)
    assert.equal(items[0].url, `${ORIGIN}/product/used-20ft-roswell-ga`)
  })

  it('skips what cannot be a valid offer, and marks sold-out stock', () => {
    const items = buildOpenAiFeedItems([
      hit({ handle: 'no-price', sale_price: 0, variants: [{ sku: 'A' }] }),
      hit({ handle: 'no-image', images: [], variants: [{ sku: 'B' }] }),
      hit({ handle: 'generic', product_category: [{ category_name: 'Generic Product Page' }], variants: [{ sku: 'C' }] }),
      hit({ handle: 'sold-out', variants: [{ sku: 'D', qty: 0 }] }),
    ])
    assert.deepEqual(items.map((i) => [i.item_id, i.availability]), [['D', 'out_of_stock']])
  })
})

describe('toParquet', () => {
  it('round-trips every row, with real Parquet lists for the array fields', async () => {
    const items = buildOpenAiFeedItems([purchase, rentToOwn, hit({ product_category: [], variants: [{ sku: 'NOCAT' }] })])
    const file = toParquet(items)
    const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer

    const rows = await parquetReadObjects({ file: buffer })
    // The reader leaves an absent optional field out; the item leaves it out too.
    assert.deepEqual(
      rows.map((row) => Object.fromEntries(Object.entries(row).filter(([, v]) => v !== null && v !== undefined))),
      items.map((item) => ({ ...item })),
    )

    const listColumns = parquetMetadata(buffer)
      .schema.filter((element) => element.converted_type === 'LIST')
      .map((element) => element.name)
    assert.deepEqual(listColumns.sort(), ['additional_image_urls', 'target_countries'])
  })
})
