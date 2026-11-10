// The homepage A/B analytics (lib/homeAb.ts): a forged or broken report can't
// write junk, a real one becomes the right counters, and the report adds up.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const { addHeatHash, addStatsHash, cleanLabel, compareRates, emptyTotals, parseHomeAbReport, reportIncrements, MAX_CLICKS_PER_REPORT } = await import('@/lib/homeAb')

describe('parseHomeAbReport', () => {
  it('needs a known variant and device', () => {
    assert.equal(parseHomeAbReport({ v: 4, d: 'd' }), null)
    assert.equal(parseHomeAbReport({ v: 2, d: 'tablet' }), null)
    assert.equal(parseHomeAbReport('nope'), null)
    assert.deepEqual(parseHomeAbReport({ v: 2, d: 'm' }), { v: 2, d: 'm' })
  })

  it('drops bad entries rather than trusting them', () => {
    const report = parseHomeAbReport({
      v: 1,
      d: 'd',
      id: 'short',
      n: 2,
      s: [25, 25, 33, 100],
      c: [['m', '/cart', 3, 10, 49], ['m', '<script>', 3, 1, 1], ['x', '', 0, 0, 0], ['m', '', 3, 50, 0], ['h', 'tel', -1, 0, 0]],
      f: ['quote-section', 'a'.repeat(61)],
    })
    assert.deepEqual(report, { v: 1, d: 'd', s: [25, 100], c: [['m', '/cart', 3, 10, 49], ['h', 'tel', -1, 0, 0]], f: ['quote-section'] })
  })

  it('caps the clicks one report may carry', () => {
    const c = Array.from({ length: MAX_CLICKS_PER_REPORT + 10 }, () => ['m', '', 0, 0, 0])
    assert.equal(parseHomeAbReport({ v: 1, d: 'd', c })?.c?.length, MAX_CLICKS_PER_REPORT)
  })
})

describe('cleanLabel', () => {
  it('takes paths, schemes and button text; refuses markup and long strings', () => {
    assert.equal(cleanLabel('  See   Prices '), 'See Prices')
    assert.equal(cleanLabel('/sale-shipping-containers'), '/sale-shipping-containers')
    assert.equal(cleanLabel('<img src=x>'), null)
    assert.equal(cleanLabel('x'.repeat(61)), null)
  })
})

describe('reportIncrements and the report', () => {
  it('turns a report into counters, and the counters back into totals', () => {
    const report = parseHomeAbReport({ v: 2, d: 'm', n: 1, e: 1, s: [25, 50], c: [['m', 'See Prices', 0, 4, 5], ['m', 'See Prices', 0, 4, 5], ['f', '/faq', -1, 0, 0]], f: ['quote-section'] })!
    const { stats, heat } = reportIncrements(report)
    assert.deepEqual(Object.fromEntries(stats), { views: 1, 'views:m': 1, engaged: 1, s25: 1, s50: 1, clicks: 3, 'c:m:See Prices': 2, 'c:f:/faq': 1, 'f:quote-section': 1 })
    assert.deepEqual(Object.fromEntries(heat), { '0:4:5': 2 })

    const totals = addStatsHash(addStatsHash(emptyTotals(), Object.fromEntries(stats)), { views: '3', 'c:m:See Prices': '1', bogus: '9' })
    assert.equal(totals.views, 4)
    assert.equal(totals.viewsMobile, 1)
    assert.equal(totals.scroll[50], 1)
    assert.equal(totals.targets['m:See Prices'], 3)
    assert.equal(totals.submits['quote-section'], 1)
    assert.deepEqual(addHeatHash({ '0:4:5': 1 }, { '0:4:5': '2', 'junk': '5' }), { '0:4:5': 3 })
  })
})

describe('compareRates', () => {
  it('waits for enough views, then calls only clear differences', () => {
    assert.equal(compareRates({ hits: 5, total: 50 }, { hits: 30, total: 50 }), 'too early')
    assert.equal(compareRates({ hits: 100, total: 1000 }, { hits: 105, total: 1000 }), 'no clear difference')
    assert.equal(compareRates({ hits: 100, total: 1000 }, { hits: 160, total: 1000 }), 'better')
    assert.equal(compareRates({ hits: 160, total: 1000 }, { hits: 100, total: 1000 }), 'worse')
  })
})
