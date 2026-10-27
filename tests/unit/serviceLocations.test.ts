// The homepage coverage list (config/serviceLocations.ts): its links and the
// counts the section copy quotes.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  CA_LOCATION_COUNT,
  LOCATION_PAGE_PATH,
  SERVICE_LOCATIONS,
  SERVICE_LOCATION_COUNT,
  SERVICE_LOCATION_LABEL,
  US_LOCATION_COUNT,
} from '@/config/serviceLocations'

describe('SERVICE_LOCATIONS', () => {
  it('links every location to a page under the where-to-buy path', () => {
    assert.equal(LOCATION_PAGE_PATH, '/where-to-buy-shipping-containers/')
    for (const { name, url } of SERVICE_LOCATIONS) {
      assert.match(url, /^\/where-to-buy-shipping-containers\/[a-z0-9-]+$/, name)
    }
  })

  it('has no duplicate names or links', () => {
    assert.equal(new Set(SERVICE_LOCATIONS.map((l) => l.name)).size, SERVICE_LOCATIONS.length)
    assert.equal(new Set(SERVICE_LOCATIONS.map((l) => l.url)).size, SERVICE_LOCATIONS.length)
  })

  it('counts what the section copy quotes', () => {
    assert.equal(SERVICE_LOCATION_COUNT, 53)
    // The headline rounds down to the ten: "Delivering From 50+ Locations".
    assert.equal(SERVICE_LOCATION_LABEL, '50+')
    assert.equal(US_LOCATION_COUNT, 44)
    assert.equal(CA_LOCATION_COUNT, 9)
  })
})
