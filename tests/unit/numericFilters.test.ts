// InstantSearch numericFilters -> Elasticsearch clauses: only the allowed
// fields, only the known operators, anything else dropped.
import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

mock.module('next/cache', { namedExports: { cacheLife: () => {}, cacheTag: () => {} } })
mock.module('@elastic/elasticsearch', { namedExports: { Client: class {} } })

const { buildNumericFilters } = await import('@/services/search.service')

describe('buildNumericFilters', () => {
  it('turns a price range into range clauses', () => {
    assert.deepEqual(buildNumericFilters(['variants.price>=50', 'variants.price<=100']), [
      { range: { 'variants.price': { gte: 50 } } },
      { range: { 'variants.price': { lte: 100 } } },
    ])
  })

  it('handles the stock filter, decimals, spaces and equality', () => {
    assert.deepEqual(buildNumericFilters(['variants.qty>=1', 'variants.price < 12.5', 'variants.qty=3']), [
      { range: { 'variants.qty': { gte: 1 } } },
      { range: { 'variants.price': { lt: 12.5 } } },
      { term: { 'variants.qty': 3 } },
    ])
  })

  it('ORs an array group', () => {
    assert.deepEqual(buildNumericFilters([['variants.price<=50', 'variants.price>=250']]), [
      { bool: { should: [{ range: { 'variants.price': { lte: 50 } } }, { range: { 'variants.price': { gte: 250 } } }], minimum_should_match: 1 } },
    ])
  })

  it('drops fields that are not allowed and anything malformed', () => {
    assert.deepEqual(
      buildNumericFilters(['status>=1', 'variants.costing<=10', 'variants.price>=abc', 'variants.price!=5', 'variants.price', '']),
      [],
    )
  })
})
