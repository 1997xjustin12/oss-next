// The rent-to-own page's copy (lib/data/rentToOwnContent.ts) against the
// pricing rule the catalogue uses (calculateProductPrice in lib/pricing.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { RTO_PAYMENT_TABLE, RTO_STARTING_MONTHLY } from '@/lib/data/rentToOwnContent'
import { calculateProductPrice } from '@/lib/pricing'

const money = (text: string) => Number(text.replace(/[$,]/g, ''))
const rto = (price: number, months: string) =>
  calculateProductPrice({ price, paymentType: 'rto', paymentTerm: months, size: '', height: '' })

describe('RTO payment table', () => {
  it('matches the rent-to-own pricing rule for every amount and term', () => {
    for (const row of RTO_PAYMENT_TABLE.rows) {
      RTO_PAYMENT_TABLE.terms.forEach((term, i) => {
        const months = term.match(/\d+/)![0]
        assert.equal(money(row.monthly[i]), rto(money(row.amount), months), `${row.amount} over ${term}`)
      })
    }
  })

  it('quotes the lead price as a $1,350 container over 48 months', () => {
    assert.equal(money(RTO_STARTING_MONTHLY), rto(1350, '48'))
  })
})
