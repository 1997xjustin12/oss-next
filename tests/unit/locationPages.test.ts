// The /where-to-buy-shipping-containers/[location] pages: wording (template +
// overrides + placeholders), listing links, SEO defaults, the seeds, and the
// depot opening hours their LocalBusiness carries (lib/locations.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const { fillPlaceholders, locationLink, locationListingHref, locationPath, locationPhone, locationSections, locationSeoDefaults, resolveLocationText } = await import('@/lib/locationPage')
const { LOCATION_PAGES, getLocationPageSeed } = await import('@/lib/data/locationPages')
const { LOCATION_PAGE_SLUGS } = await import('@/lib/data/locationPageSlugs')
const { LOCATION_TEMPLATE_DEFAULT } = await import('@/lib/data/locationTemplate')
const { toOpeningHours } = await import('@/lib/locations')
const { DEPOT_FEATURED_SPECS } = await import('@/services/search.service')
const { telHref } = await import('@/lib/helpers')
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
    // Atlanta's own wording (an override); the template names the city.
    assert.equal(text.buy.heading, 'Buy A Shipping Container In [[Georgia]] At the best price')
    assert.ok(text.overview.body.includes('[[Atlanta, Georgia]]'))
    assert.ok(text.callBand.includes('{phone}'))
  })

  it('lays a location’s overrides over the template, field by field; an empty one keeps the template’s', () => {
    const calgary = { ...atlanta, place: { city: 'Calgary', region: 'AB', regionName: 'Alberta', label: 'Calgary, AB' }, text: { buy: { heading: 'Buy In [[{regionName}]]', body: '  ' }, budgetBand: 'BANDS' } }
    const text = resolveLocationText(LOCATION_TEMPLATE_DEFAULT, calgary)
    assert.equal(text.buy.heading, 'Buy In [[Alberta]]')
    assert.equal(resolveLocationText(LOCATION_TEMPLATE_DEFAULT, { ...calgary, text: undefined }).buy.heading, 'Buy A Shipping Container In [[Calgary, AB]] At the best price')
    assert.ok(text.buy.body.startsWith('Looking to buy a shipping container in Alberta'))
    assert.equal(text.buy.cta, LOCATION_TEMPLATE_DEFAULT.text.buy.cta)
    assert.equal(text.budgetBand, 'BANDS')
  })

  it('quotes the rental from the catalogue, never a typed-in price', () => {
    assert.ok(LOCATION_TEMPLATE_DEFAULT.text.rental.body.includes('{lowestRent}'))
    assert.ok(!/\$\d/.test(LOCATION_TEMPLATE_DEFAULT.text.rental.body))
    const text = resolveLocationText(LOCATION_TEMPLATE_DEFAULT, atlanta, { lowestRent: '$95.00' })
    assert.ok(text.rental.body.includes('starting as low as $95.00 a month'))
  })

  it('shows an unknown placeholder as written rather than dropping it', () => {
    assert.equal(fillPlaceholders('in {citty}', { city: 'Atlanta' }), 'in {citty}')
  })
})

describe('a location’s own phone, sections and buttons', () => {
  const temecula = getLocationPageSeed('temecula-ca')!
  const indianapolis = getLocationPageSeed('indianapolis-in')!
  const losAngeles = getLocationPageSeed('los-angeles-long-beach-ca')!

  it('shows and dials the location’s own number where it has one', () => {
    assert.equal(locationPhone(temecula), '(951) 399-2653')
    assert.equal(locationPhone(atlanta), '(888) 977-9085')
    // Indianapolis's "Call for Best Deals" dials its phone, the sales line.
    assert.equal(locationLink(indianapolis, 'buy'), telHref('(888) 977-9085'))
  })

  it('keeps the template’s sections unless the location lists its own', () => {
    assert.ok(!locationSections(LOCATION_TEMPLATE_DEFAULT, atlanta).includes('faq'))
    assert.deepEqual(locationSections(LOCATION_TEMPLATE_DEFAULT, losAngeles).slice(-3), ['pricingForm', 'newsletter', 'faq'])
    assert.ok(!locationSections(LOCATION_TEMPLATE_DEFAULT, indianapolis).includes('delivered'))
  })

  it('opens the depot’s listing unless the location says otherwise', () => {
    assert.equal(locationLink(atlanta, 'rental'), '/sale-shipping-containers?location=Atlanta%2C+GA&ptype=rental')
    assert.equal(locationLink(indianapolis, 'rto'), '/shipping-container-quote')
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
    assert.equal(isNativePath(locationPath('baltimore-md-old')), false)
  })
})

describe('the seeds', () => {
  it('claim exactly the records’ paths, each once', () => {
    assert.deepEqual([...LOCATION_PAGE_SLUGS].sort(), LOCATION_PAGES.map((page) => page.slug).sort())
    assert.equal(new Set(LOCATION_PAGE_SLUGS).size, LOCATION_PAGES.length)
  })

  it('have real depots, the template’s specs, and no placeholder left unknown', () => {
    const placeholders = new Set(['city', 'region', 'regionName', 'cityRegion', 'phone', 'lowestRent'])
    const specs = new Set(DEPOT_FEATURED_SPECS.map((spec) => spec.key))
    for (const key of LOCATION_TEMPLATE_DEFAULT.productSpecs) assert.ok(specs.has(key), key)
    for (const page of LOCATION_PAGES) {
      for (const token of JSON.stringify(page.text ?? {}).matchAll(/\{(\w+)\}/g)) assert.ok(placeholders.has(token[1]), `${page.slug}: {${token[1]}}`)
      for (const key of page.productSpecs ?? []) assert.ok(specs.has(key), `${page.slug}: ${key}`)
      assert.ok(page.place.label && page.depot && page.seo.title, page.slug)
      for (const story of [page.featured, page.news]) if (story) assert.ok(story.paragraphs.length > 0 && story.title, page.slug)
      assert.ok(page.nearbyCities.every((city) => city.href.startsWith('/') && !city.href.endsWith('/')), page.slug)
    }
  })

  it('show every delivery photo once', () => {
    for (const page of LOCATION_PAGES) {
      const all = [...page.deliveredLead, ...LOCATION_TEMPLATE_DEFAULT.deliveredPhotos].map((photo) => photo.src)
      assert.equal(new Set(all).size, all.length, page.slug)
    }
  })
})
