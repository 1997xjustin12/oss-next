// The national GBP page (/get): the GBP template with no single location.
// What it leaves out (map, local listing, sitemap entry) and what a record
// cannot change about it.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { findNativePageById } from '@/config/pages'
import { GBP_PAGES } from '@/lib/data/gbpPages'
import { gbpJsonLd, gbpPageLabel, gbpSeoDefaults, requireGbpPage } from '@/lib/gbp'
import { gbpContentKeys } from '@/lib/gbpAdmin'
import { conformGbpPage, optionalMapsEmbedUrl } from '@/lib/gbpValidate'

const national = requireGbpPage('get')
const city = GBP_PAGES[0]

type Node = Record<string, unknown>
const nodes = (page: typeof national) => (gbpJsonLd(page)['@graph'] as Node[])

describe('the national page record', () => {
  it('has no location, no map and the main line', () => {
    assert.equal(national.location, null)
    assert.equal(national.mapEmbedUrl, '')
    assert.equal(national.contact.phoneE164, '+18886674834')
    assert.equal(national.seo.noindex, true)
  })

  it('a record can neither give it a city nor take a city page’s away', () => {
    const location = { city: 'Austin', stateCode: 'TX', stateName: 'Texas' }
    assert.equal(conformGbpPage({ location }, national).location, null)
    assert.deepEqual(conformGbpPage({ location: null }, city).location, city.location)
  })

  it('accepts an empty map, still only a Google Maps embed otherwise', () => {
    assert.equal(optionalMapsEmbedUrl(''), '')
    assert.equal(optionalMapsEmbedUrl('https://evil.example/frame'), undefined)
    assert.equal(conformGbpPage({ mapEmbedUrl: '' }, city).mapEmbedUrl, '')
  })
})

describe('its head and structured data', () => {
  it('is noindex, follow; a city page sets no robots', () => {
    assert.deepEqual(gbpSeoDefaults(national).robots, { index: false, follow: true })
    assert.equal(gbpSeoDefaults(city).robots, undefined)
    assert.equal(gbpSeoDefaults(national).canonical, 'https://onsitestorage.com/get')
  })

  it('has no SelfStorage listing; a city page has one', () => {
    assert.ok(!nodes(national).some((node) => node['@type'] === 'SelfStorage'))
    assert.ok(nodes(city).some((node) => node['@type'] === 'SelfStorage'))
  })

  it('names itself in the breadcrumb and the admin without a city', () => {
    const crumbs = nodes(national).find((node) => node['@type'] === 'BreadcrumbList')?.itemListElement as Node[]
    assert.equal(crumbs.at(-1)?.name, 'Shipping Containers For Sale')
    assert.equal(gbpPageLabel(national), 'Nationwide')
    assert.ok(!gbpContentKeys(national).includes('location'))
    assert.ok(gbpContentKeys(city).includes('location'))
  })

  it('is in the Page Configurator, marked not indexable', () => {
    assert.deepEqual(findNativePageById('get'), { id: 'get', path: '/get', label: 'GBP — Nationwide', group: 'Locations', indexable: false })
    assert.equal(findNativePageById(city.slug)?.indexable, true)
  })
})
