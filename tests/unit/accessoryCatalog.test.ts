// The accessories page's InstantSearch helpers: URL <-> UI state, the sort
// mapping, category links and the hit -> card mapping.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  ACCESSORY_FILTER_CATEGORIES,
  ACCESSORY_INDEX,
  CATEGORY_ATTRIBUTE,
  PRICE_ATTRIBUTE,
  STOCK_ATTRIBUTE,
  ACCESSORY_MAX_QUANTITY,
  accessoryCartItem,
  accessoryCategoryHref,
  hitToAccessoryCard,
  paramsFromUiState,
  sortParamForIndex,
  uiStateFromParams,
} from '@/lib/accessoryCatalog'

describe('uiStateFromParams', () => {
  it('is empty with no params', () => {
    assert.deepEqual(uiStateFromParams(new URLSearchParams()), {})
  })

  it('maps every param, in InstantSearch terms', () => {
    const state = uiStateFromParams(new URLSearchParams('category=Security,Ramp&price=50-100&stock=in&sort=price-asc&q=lock&page=3'))
    assert.deepEqual(state, {
      query: 'lock',
      refinementList: { [CATEGORY_ATTRIBUTE]: ['Security', 'Ramp'] },
      numericMenu: { [PRICE_ATTRIBUTE]: '50:100', [STOCK_ATTRIBUTE]: '1:' },
      sortBy: `${ACCESSORY_INDEX}_price_asc`,
      page: 3,
    })
  })

  it('drops unknown categories, ranges, sorts and junk pages', () => {
    const state = uiStateFromParams({ category: 'Security,Bogus,Security', price: 'free', sort: 'random', page: '-1', stock: 'yes' })
    assert.deepEqual(state, { refinementList: { [CATEGORY_ATTRIBUTE]: ['Security'] } })
  })

  it('does not offer "Accessories" (the default scope), and ignores it in a URL', () => {
    assert.ok(!(ACCESSORY_FILTER_CATEGORIES as readonly string[]).includes('Accessories'))
    assert.deepEqual(uiStateFromParams({ category: 'Accessories,Ramp' }), { refinementList: { [CATEGORY_ATTRIBUTE]: ['Ramp'] } })
  })

  it('reads the open-ended range and caps the search length', () => {
    assert.equal(uiStateFromParams({ price: '250-up' }).numericMenu?.[PRICE_ATTRIBUTE], '250:')
    assert.equal(uiStateFromParams({ q: 'x'.repeat(200) }).query?.length, 80)
  })
})

describe('paramsFromUiState', () => {
  it('round-trips the URL', () => {
    const url = '?category=Security%2CRamp&price=50-100&stock=in&sort=price-asc&q=lock&page=3'
    assert.equal(paramsFromUiState(uiStateFromParams(new URLSearchParams(url))), url)
  })

  it('leaves defaults out', () => {
    assert.equal(paramsFromUiState({}), '')
    assert.equal(paramsFromUiState({ sortBy: ACCESSORY_INDEX, page: 1 }), '')
  })
})

describe('sort and links', () => {
  it('maps each sort index to the server sort', () => {
    assert.equal(sortParamForIndex(ACCESSORY_INDEX), 'default')
    assert.equal(sortParamForIndex(`${ACCESSORY_INDEX}_price_desc`), 'price_desc')
    assert.equal(sortParamForIndex(`${ACCESSORY_INDEX}_newest`), 'newest')
    assert.equal(sortParamForIndex('something_else'), 'default')
  })

  it('links a category tile to the filtered results', () => {
    assert.equal(accessoryCategoryHref('Ramp'), '/shipping-container-accessory-products?category=Ramp#products')
  })
})

describe('hitToAccessoryCard', () => {
  const hit = {
    objectID: 'abc',
    title: 'Steel Ramp',
    handle: 'steel-ramp',
    sale_price: 899,
    images: [{ src: 'https://cdn.example/ramp.webp', alt: 'A ramp' }],
    variants: [{ qty: 12 }],
    product_category: [{ category_name: 'Accessories' }, { category_name: 'Ramp' }],
  }

  it('maps the fields a card shows', () => {
    assert.deepEqual(hitToAccessoryCard(hit), {
      id: 'abc',
      handle: 'steel-ramp',
      title: 'Steel Ramp',
      price: 899,
      imageUrl: 'https://cdn.example/ramp.webp',
      imageAlt: 'A ramp',
      inStock: true,
      category: 'Ramp',
    })
  })

  it('prefers the specific category, falls back to Accessories', () => {
    assert.equal(hitToAccessoryCard({ ...hit, product_category: [{ category_name: 'Accessories' }] }).category, 'Accessories')
    assert.equal(hitToAccessoryCard({ ...hit, product_category: [{ category_name: 'Free Shipping' }] }).category, '')
  })

  it('in stock only for a quantity of at least 1 on the first variant', () => {
    assert.equal(hitToAccessoryCard({ ...hit, variants: [{ qty: null }] }).inStock, false)
    assert.equal(hitToAccessoryCard({ ...hit, variants: [{ qty: 0 }] }).inStock, false)
    assert.equal(hitToAccessoryCard({ ...hit, variants: [] }).inStock, false)
    assert.equal(hitToAccessoryCard({ ...hit, variants: [{ qty: '3' }] }).inStock, true)
  })

  it('survives a hit with missing fields', () => {
    const card = hitToAccessoryCard({ title: 'Bare' })
    assert.equal(card.price, 0)
    assert.equal(card.imageUrl, undefined)
    assert.equal(card.imageAlt, 'Bare')
  })
})

describe('accessoryCartItem', () => {
  const hit = {
    objectID: 'abc',
    title: 'Steel Ramp',
    handle: 'steel-ramp',
    sale_price: 899,
    images: [{ src: 'https://cdn.example/ramp.webp' }],
    variants: [{ sku: 'RAMP-1', qty: 4 }],
    custom_fields: [{ name: 'condition', value: 'New' }],
    product_category: [{ category_name: 'Ramp' }],
  }

  it('builds the same cart line the product page adds, with the quantity', () => {
    const item = accessoryCartItem(hit, 3)
    assert.deepEqual({ ...item, rawHit: undefined }, {
      id: 'abc',
      name: 'Steel Ramp',
      price: 899,
      quantity: 3,
      sku: 'RAMP-1',
      condition: 'New',
      orderType: 'Purchase',
      image: 'https://cdn.example/ramp.webp',
      rawHit: undefined,
    })
    assert.equal(item.rawHit, hit)
  })

  it('keeps the quantity between 1 and the maximum', () => {
    assert.equal(accessoryCartItem(hit, 0).quantity, 1)
    assert.equal(accessoryCartItem(hit, -5).quantity, 1)
    assert.equal(accessoryCartItem(hit, 2.6).quantity, 3)
    assert.equal(accessoryCartItem(hit, 1000).quantity, ACCESSORY_MAX_QUANTITY)
  })
})
