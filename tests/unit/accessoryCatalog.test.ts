// The accessories page's URL-driven listing: parsing, filtering, counts, paging
// and the links/fields that carry the state.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  ACCESSORY_PAGE_SIZE,
  accessoryHiddenFields,
  accessoryHref,
  applyAccessoryQuery,
  hasActiveFilters,
  parseAccessoryQuery,
  toggleCategory,
  withQuery,
} from '@/lib/accessoryCatalog'
import { ACCESSORY_CATALOG_DEMO } from '@/lib/data/accessoryCatalogDemo'

const all = ACCESSORY_CATALOG_DEMO

describe('parseAccessoryQuery', () => {
  it('defaults when nothing is set', () => {
    assert.deepEqual(parseAccessoryQuery({}), { categories: [], price: null, inStockOnly: false, sort: 'popularity', q: '', page: 1 })
  })

  it('keeps known values and drops unknown or junk ones', () => {
    const q = parseAccessoryQuery({ category: 'security,bogus,lighting,security', price: '50-100', stock: 'in', sort: 'price-desc', q: '  lock ', page: '3' })
    assert.deepEqual(q, { categories: ['security', 'lighting'], price: '50-100', inStockOnly: true, sort: 'price-desc', q: 'lock', page: 3 })
    const junk = parseAccessoryQuery({ price: 'free', sort: 'random', page: '-2', stock: 'yes' })
    assert.equal(junk.price, null)
    assert.equal(junk.sort, 'popularity')
    assert.equal(junk.page, 1)
    assert.equal(junk.inStockOnly, false)
  })

  it('takes the first value of a repeated param and caps the search length', () => {
    assert.equal(parseAccessoryQuery({ sort: ['newest', 'price-asc'] }).sort, 'newest')
    assert.equal(parseAccessoryQuery({ q: 'x'.repeat(200) }).q.length, 80)
  })
})

describe('applyAccessoryQuery', () => {
  it('pages the full list', () => {
    const r = applyAccessoryQuery(all, parseAccessoryQuery({}))
    assert.equal(r.total, all.length)
    assert.equal(r.items.length, Math.min(ACCESSORY_PAGE_SIZE, all.length))
    assert.equal(r.pageCount, Math.ceil(all.length / ACCESSORY_PAGE_SIZE))
  })

  it('filters by category, price, stock and search together', () => {
    const r = applyAccessoryQuery(all, parseAccessoryQuery({ category: 'security', price: 'under-50', stock: 'in', q: 'padlock' }))
    assert.deepEqual(r.items.map((i) => i.title), ['Shrouded Padlock'])
  })

  it('sorts by price both ways', () => {
    const asc = applyAccessoryQuery(all, parseAccessoryQuery({ sort: 'price-asc' })).items.map((i) => i.price)
    assert.deepEqual(asc, [...asc].sort((a, b) => a - b))
    const desc = applyAccessoryQuery(all, parseAccessoryQuery({ sort: 'price-desc' })).items.map((i) => i.price)
    assert.deepEqual(desc, [...desc].sort((a, b) => b - a))
  })

  it('counts each option against the other active filters', () => {
    const r = applyAccessoryQuery(all, parseAccessoryQuery({ category: 'security', stock: 'in' }))
    // Category counts ignore the category filter itself, so other categories still show what they would add.
    assert.equal(r.counts.category.security, all.filter((i) => i.category === 'security' && i.inStock).length)
    assert.equal(r.counts.category.lighting, all.filter((i) => i.category === 'lighting' && i.inStock).length)
    // Price counts do respect the category filter.
    const securityInStock = all.filter((i) => i.category === 'security' && i.inStock)
    assert.equal(Object.values(r.counts.price).reduce((a, b) => a + b, 0), securityInStock.length)
  })

  it('clamps a page past the end to the last page', () => {
    const r = applyAccessoryQuery(all, parseAccessoryQuery({ page: '99' }))
    assert.equal(r.page, r.pageCount)
    assert.ok(r.items.length > 0)
  })

  it('returns an empty first page when nothing matches', () => {
    const r = applyAccessoryQuery(all, parseAccessoryQuery({ q: 'no such thing' }))
    assert.deepEqual([r.total, r.items.length, r.page, r.pageCount], [0, 0, 1, 1])
  })
})

describe('links and form fields', () => {
  const base = parseAccessoryQuery({})

  it('builds short URLs, defaults left out', () => {
    assert.equal(accessoryHref(base, false), '/shipping-container-accessory-products')
    assert.equal(accessoryHref(base), '/shipping-container-accessory-products#products')
    const q = parseAccessoryQuery({ category: 'ramps,parts', price: '250-up', stock: 'in', sort: 'newest', q: 'steel ramp', page: '2' })
    assert.equal(
      accessoryHref(q, false),
      '/shipping-container-accessory-products?category=ramps%2Cparts&price=250-up&stock=in&sort=newest&q=steel+ramp&page=2',
    )
  })

  it('goes back to page 1 on any filter change, and toggles categories', () => {
    const onPage3 = { ...base, page: 3 }
    assert.equal(withQuery(onPage3, { inStockOnly: true }).page, 1)
    const one = toggleCategory(base, 'security')
    assert.deepEqual(one.categories, ['security'])
    assert.deepEqual(toggleCategory(one, 'security').categories, [])
  })

  it('carries the other filters through the search and sort forms', () => {
    const q = parseAccessoryQuery({ category: 'security', sort: 'price-asc', q: 'lock', page: '2' })
    assert.deepEqual(accessoryHiddenFields(q, 'q'), { category: 'security', sort: 'price-asc' })
    assert.deepEqual(accessoryHiddenFields(q, 'sort'), { category: 'security', q: 'lock' })
    assert.equal(hasActiveFilters(base), false)
    assert.equal(hasActiveFilters(q), true)
  })
})
