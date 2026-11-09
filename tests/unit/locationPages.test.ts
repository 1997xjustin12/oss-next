// The /where-to-buy-shipping-containers/[location] pages: wording (template +
// overrides + placeholders), listing links, SEO defaults, the seeds, and the
// depot opening hours their LocalBusiness carries (lib/locations.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const { fillPlaceholders, locationListingHref, locationPath, locationSeoDefaults, resolveLocationText } = await import('@/lib/locationPage')
const { LOCATION_PAGES, LOCATION_PAGE_SLUGS, getLocationPageSeed } = await import('@/lib/data/locationPages')
const { LOCATION_TEMPLATE_DEFAULT } = await import('@/lib/data/locationTemplate')
const { toOpeningHours } = await import('@/lib/locations')
const { DEPOT_FEATURED_SPECS } = await import('@/services/search.service')
const { isNativePath } = await import('@/config/routes')

const atlanta = getLocationPageSeed('atlanta-ga')!

describe('toOpeningHours', () => {
  const day = (hours: string) => [hours]
  it('collapses a week of the same hours into one Mo-Su range', () => {
    const week = Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => [d, day('06:00 AM - 05:00 PM')]))
    assert.deepEqual(toOpeningHours(JSON.stringify(week)), ['Mo-Su 06:00-17:00'])
  })

  it('splits runs and skips closed days', () => {
    const hours = { mon: day('06:00 AM - 05:00 PM'), tue: day('06:00 AM - 05:00 PM'), wed: day('08:00 AM - 04:00 PM'), sat: day('09:00 AM - 12:00 PM') }
    assert.deepEqual(toOpeningHours(JSON.stringify(hours)), ['Mo-Tu 06:00-17:00', 'We 08:00-16:00', 'Sa 09:00-12:00'])
  })

  it('never emits an undefined day', () => {
    const one = { mon: day('06:00 AM - 05:00 PM') }
    assert.deepEqual(toOpeningHours(JSON.stringify(one)), ['Mo 06:00-17:00'])
  })
})

describe('resolveLocationText', () => {
  it('fills the place into the template, leaving {phone} for the renderer', () => {
    const text = resolveLocationText(LOCATION_TEMPLATE_DEFAULT, atlanta)
    assert.equal(text.hero.heading, 'Shipping Containers For Sale [[Atlanta, GA]]')
    assert.equal(text.buy.heading, 'Buy A Shipping Container In [[Georgia]] At the best price')
    assert.ok(text.callBand.includes('{phone}'))
  })

  it('lays a location’s overrides over the template, field by field; an empty one keeps the template’s', () => {
    const calgary = { ...atlanta, place: { city: 'Calgary', region: 'AB', regionName: 'Alberta' }, text: { buy: { heading: 'Buy A Shipping Container In [[{cityRegion}]] At the best price', body: '  ' }, budgetBand: 'BANDS' } }
    const text = resolveLocationText(LOCATION_TEMPLATE_DEFAULT, calgary)
    assert.equal(text.buy.heading, 'Buy A Shipping Container In [[Calgary, AB]] At the best price')
    assert.ok(text.buy.body.startsWith('Looking to buy a shipping container in Alberta'))
    assert.equal(text.buy.cta, LOCATION_TEMPLATE_DEFAULT.text.buy.cta)
    assert.equal(text.budgetBand, 'BANDS')
  })

  it('shows an unknown placeholder as written rather than dropping it', () => {
    assert.equal(fillPlaceholders('in {citty}', { city: 'Atlanta' }), 'in {citty}')
  })
})

describe('location links and SEO', () => {
  it('opens the listing for the page’s depot', () => {
    assert.equal(locationListingHref('Atlanta, GA'), '/sale-shipping-containers?location=Atlanta%2C+GA')
    assert.equal(locationListingHref('Atlanta, GA', 'rto'), '/sale-shipping-containers?location=Atlanta%2C+GA&ptype=rto')
  })

  it('carries WordPress’s title whole, with its own canonical', () => {
    const seo = locationSeoDefaults(atlanta)
    assert.equal(seo.title, 'Shipping Container for Sale in Atlanta | Buy, Rent & Rent-to-Own')
    assert.equal(seo.absoluteTitle, true)
    assert.equal(seo.canonical, '/where-to-buy-shipping-containers/atlanta-ga')
  })

  it('claims exactly the native locations as native paths', () => {
    assert.equal(isNativePath(locationPath('atlanta-ga')), true)
    assert.equal(isNativePath(locationPath('calgary-ab')), false)
  })
})

describe('the seeds', () => {
  it('have unique slugs, real depots and the template’s specs', () => {
    assert.equal(new Set(LOCATION_PAGE_SLUGS).size, LOCATION_PAGES.length)
    const known = new Set(DEPOT_FEATURED_SPECS.map((spec) => spec.key))
    for (const key of LOCATION_TEMPLATE_DEFAULT.productSpecs) assert.ok(known.has(key), key)
    for (const page of LOCATION_PAGES) {
      assert.ok(page.featured.paragraphs.length > 0 && page.news.paragraphs.length > 0, page.slug)
      assert.ok(page.nearbyCities.every((city) => city.href.startsWith('/') && !city.href.endsWith('/')), page.slug)
    }
  })

  it('show every delivery photo once', () => {
    const all = [...atlanta.deliveredLead, ...LOCATION_TEMPLATE_DEFAULT.deliveredPhotos].map((photo) => photo.src)
    assert.equal(new Set(all).size, all.length)
  })
})
