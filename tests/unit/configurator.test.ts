// The configurator's selection rules (lib/configurator.ts), on the rent-to-own
// setup the page uses.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { productsByLastGroup, resolveSelection, startingPrice, type ConfiguratorProduct } from '@/lib/configurator'
import { RTO_CONFIGURATOR } from '@/lib/data/rentToOwnContent'

const { groups, defaults, leadTerm } = RTO_CONFIGURATOR

function product(size: string, condition: string, grade: string, term: string, price: number): ConfiguratorProduct {
  return {
    id: `${condition}_${size}_${grade}_${term}`,
    title: '',
    price,
    sku: '',
    location: 'Atlanta, GA',
    specs: { size, condition, grade, term },
    sizeLabel: '',
    conditionLabel: '',
    images: [],
    video: null,
    rating: { value: 0, count: 0 },
  }
}

// As the catalogue stocks it: New only as IICL; Used as WWT and IICL.
const STOCK = [
  product('20s', 'used', 'wwt', '48', 61.36),
  product('20s', 'used', 'wwt', '36', 75),
  product('20s', 'used', 'wwt', '24', 100.75),
  product('20s', 'used', 'wwt', '12', 160.71),
  product('20s', 'used', 'iicl', '48', 79.55),
  product('20s', 'new', 'iicl', '48', 131.82),
  product('20s', 'new', 'iicl', '12', 345.24),
  product('40h', 'used', 'wwt', '48', 90.91),
  // AS IS isn't offered here, so it must never become selectable.
  product('40s', 'used', 'asis', '48', 50),
]

describe('resolveSelection', () => {
  it('keeps the defaults when they are stocked', () => {
    assert.deepEqual(resolveSelection(STOCK, groups, defaults).selection, defaults)
  })

  it('checks each group only against the groups above it, so New stays reachable', () => {
    const { available } = resolveSelection(STOCK, groups, defaults)
    assert.ok(available.condition.has('new'), 'New must be pickable from Used / WWT')
    assert.deepEqual([...available.grade], ['wwt', 'iicl'])
  })

  it('moves a choice the groups above rule out to the first available option', () => {
    const { selection, available } = resolveSelection(STOCK, groups, { ...defaults, condition: 'new' })
    assert.equal(selection?.grade, 'iicl')
    assert.deepEqual([...available.grade], ['iicl'])
    assert.deepEqual([...available.term], ['48', '12'])
  })

  it('disables a size whose only stock is in a grade the page does not offer', () => {
    const { available } = resolveSelection(STOCK, groups, defaults)
    assert.deepEqual([...available.size], ['20s', '40h'])
  })

  it('returns no selection, and nothing available, for an empty depot', () => {
    const { selection, available } = resolveSelection([], groups, defaults)
    assert.equal(selection, null)
    for (const group of groups) assert.equal(available[group.key].size, 0)
  })
})

describe('term prices and "Pricing Starts at"', () => {
  it('prices each term from its own product, with the spec held', () => {
    const byTerm = productsByLastGroup(STOCK, groups, defaults)
    assert.deepEqual(
      [...byTerm].map(([term, p]) => [term, p.price]),
      [['48', 61.36], ['36', 75], ['24', 100.75], ['12', 160.71]],
    )
  })

  it('quotes the 48-month price whatever term is picked', () => {
    const byTerm = productsByLastGroup(STOCK, groups, { ...defaults, term: '12' })
    assert.equal(startingPrice(byTerm, leadTerm), 61.36)
  })

  it('falls back to the cheapest term when the container has no 48-month product', () => {
    const noLead = STOCK.filter((p) => !(p.specs.condition === 'new' && p.specs.term === '48'))
    const byTerm = productsByLastGroup(noLead, groups, { size: '20s', condition: 'new', grade: 'iicl', term: '12' })
    assert.equal(startingPrice(byTerm, leadTerm), 345.24)
  })
})
