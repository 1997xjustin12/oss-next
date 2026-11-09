// The location pages' stored records (lib/locationValidate.ts) and their admin
// form (lib/locationAdmin.ts): a bad edit never breaks a page, and opening a
// location in the admin and saving it changes nothing.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const { conformLocationPage, conformLocationTemplate, href, textOverrides } = await import('@/lib/locationValidate')
const { toLocationPageForm } = await import('@/lib/locationAdmin')
const { LOCATION_PAGES, getLocationPageSeed } = await import('@/lib/data/locationPages')
const { LOCATION_TEMPLATE_DEFAULT } = await import('@/lib/data/locationTemplate')

const atlanta = getLocationPageSeed('atlanta-ga')!

describe('conformLocationPage', () => {
  it('round-trips every record through the admin form unchanged', () => {
    for (const page of LOCATION_PAGES) {
      const form = toLocationPageForm(page, LOCATION_TEMPLATE_DEFAULT)
      assert.deepEqual(conformLocationPage(form, page), page, page.slug)
    }
  })

  it('keeps the seed’s field where the record’s is invalid, and never takes a slug from it', () => {
    const out = conformLocationPage({ slug: 'elsewhere', depot: '', mapImage: { src: 'not a url' }, place: { city: 'X' } }, atlanta)
    assert.equal(out.slug, 'atlanta-ga')
    assert.equal(out.depot, atlanta.depot)
    assert.deepEqual(out.mapImage, atlanta.mapImage)
    assert.deepEqual(out.place, atlanta.place)
  })

  it('drops cleared optional fields, so the template applies', () => {
    const temecula = getLocationPageSeed('temecula-ca')!
    const out = conformLocationPage({ ...temecula, phone: '', sections: null, productSpecs: [], links: { buy: '' }, faqYoutubeId: '' }, temecula)
    assert.equal(out.phone, undefined)
    assert.equal(out.sections, undefined)
    assert.equal(out.productSpecs, undefined)
    assert.equal(out.links, undefined)
  })

  it('refuses a phone that is not “(888) 977-9085”, keeping the stored one', () => {
    const temecula = getLocationPageSeed('temecula-ca')!
    assert.equal(conformLocationPage({ phone: '951-399-2653' }, temecula).phone, temecula.phone)
  })

  it('takes a map or a story away (null)', () => {
    const out = conformLocationPage({ mapImage: null, featured: null }, atlanta)
    assert.equal(out.mapImage, null)
    assert.equal(out.featured, null)
  })
})

describe('textOverrides', () => {
  it('keeps only the template’s own fields, only with something in them', () => {
    const out = textOverrides({ budgetBand: 'BAND', buy: { heading: 'Mine', body: '  ', bogus: 'x' }, nope: { a: 'b' } })
    assert.deepEqual(out, { budgetBand: 'BAND', buy: { heading: 'Mine' } })
  })
})

describe('href', () => {
  it('takes paths, https URLs, tel: and mailto:, and trims a trailing slash', () => {
    assert.equal(href('/shipping-container-quote/'), '/shipping-container-quote')
    assert.equal(href('tel:'), 'tel:')
    assert.equal(href('https://secure.financ.ing/?a=1'), 'https://secure.financ.ing/?a=1')
    assert.equal(href('javascript:alert(1)'), undefined)
    assert.equal(href('//evil.example'), undefined)
  })
})

describe('conformLocationTemplate', () => {
  it('falls back to the seed for anything unreadable', () => {
    assert.deepEqual(conformLocationTemplate('garbage', LOCATION_TEMPLATE_DEFAULT), LOCATION_TEMPLATE_DEFAULT)
  })

  it('keeps the seed’s wording for whatever a partial text record lacks', () => {
    const out = conformLocationTemplate({ text: { budgetBand: 'NEW BAND', buy: { heading: 'H' } } }, LOCATION_TEMPLATE_DEFAULT)
    assert.equal(out.text.budgetBand, 'NEW BAND')
    assert.equal(out.text.buy.heading, 'H')
    assert.equal(out.text.buy.body, LOCATION_TEMPLATE_DEFAULT.text.buy.body)
    assert.equal(out.text.hero.heading, LOCATION_TEMPLATE_DEFAULT.text.hero.heading)
  })

  it('lists every section once: a missing one is added, hidden, at the end', () => {
    const out = conformLocationTemplate({ sections: [{ id: 'hero', enabled: true }, { id: 'hero', enabled: false }, { id: 'nope', enabled: true }] }, LOCATION_TEMPLATE_DEFAULT)
    assert.deepEqual(out.sections[0], { id: 'hero', enabled: true })
    assert.equal(out.sections.filter((s) => s.id === 'hero').length, 1)
    assert.equal(out.sections.length, LOCATION_TEMPLATE_DEFAULT.sections.length)
    assert.ok(out.sections.slice(1).every((s) => !s.enabled))
  })

  it('drops an unknown product spec', () => {
    const out = conformLocationTemplate({ productSpecs: ['used_20s_wwt', 'spaceship'] }, LOCATION_TEMPLATE_DEFAULT)
    assert.deepEqual(out.productSpecs, ['used_20s_wwt'])
  })
})
