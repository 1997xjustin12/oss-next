import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  cheapestDeliveryOption,
  displayedDeliveryOption,
  hasQuotedDelivery,
  planDeliveryRate,
} from '@/lib/delivery'
import type { DeliveryRateOption, DeliveryRates } from '@/types/delivery'

function option(overrides: Partial<DeliveryRateOption>): DeliveryRateOption {
  return {
    key: 'tilt_bed',
    label: 'Tilt Bed Delivery',
    rate: null,
    rate_formatted: '',
    available: false,
    call_for_rate: true,
    rate_per_mile: null,
    min_rate: null,
    plan_rate: null,
    ...overrides,
  }
}

const rates = (options: DeliveryRateOption[]) => ({ options }) as DeliveryRates

describe('planDeliveryRate', () => {
  it('reads the rate the backend holds back on a rental or rent-to-own line', () => {
    assert.equal(planDeliveryRate({ available: false, hidden_reason: 'rto_rental', cost: 900 }), 900)
  })

  it('leaves a rate over the ceiling to a phone call', () => {
    assert.equal(planDeliveryRate({ available: false, hidden_reason: 'rto_rental', cost: 1600 }), null)
  })

  it('has nothing to add for a purchase or a withheld rate', () => {
    assert.equal(planDeliveryRate({ available: true, hidden_reason: '', cost: 450 }), null)
    assert.equal(planDeliveryRate({ available: false, hidden_reason: 'call_for_quote', cost: 1350 }), null)
  })
})

describe('displayedDeliveryOption', () => {
  it('prefers a purchase rate', () => {
    const quoted = option({ rate: 450, available: true, call_for_rate: false })
    assert.equal(displayedDeliveryOption(rates([quoted]))?.rate, 450)
  })

  it('shows the cheapest rental rate and ignores pickup', () => {
    const shown = displayedDeliveryOption(
      rates([
        option({ key: 'flat_bed', plan_rate: 800 }),
        option({ plan_rate: 450 }),
        option({ key: 'pickup', plan_rate: 0 }),
      ]),
    )
    assert.equal(shown?.key, 'tilt_bed')
    assert.equal(shown?.rate, 450)
  })

  it('is null when every rate is over the ceiling, so the page says to call', () => {
    assert.equal(displayedDeliveryOption(rates([option({})])), null)
  })

  it('does not make a rental rate quotable, so an order total still leaves it out', () => {
    const rental = rates([option({ plan_rate: 900 })])
    assert.equal(cheapestDeliveryOption(rental), null)
    assert.equal(hasQuotedDelivery(rental), false)
  })
})
