// The /all-city/ configurator's pure parts: validation (lib/allCityValidate.ts),
// the editor's forms, list filters and bulk edits (lib/allCityAdmin.ts), and
// the duplicates & issues report (lib/allCityIssues.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const { conformAllCityDepot, conformAllCityPage, conformAllCityTemplate, imageSrc } = await import('@/lib/allCityValidate')
const { applyAllCityBulkChange, matchesAllCityFilter, toAllCityDepotForm, toAllCityPageForm } = await import('@/lib/allCityAdmin')
const { findAllCityIssues } = await import('@/lib/allCityIssues')
const { allSeedPages, getSeedPage } = await import('@/lib/allCitySeed')
const { ALL_CITY_DEPOTS } = await import('@/lib/data/allCityDepots')
const { ALL_CITY_TEMPLATE_DEFAULT } = await import('@/lib/data/allCityTemplate')

const cocoa = getSeedPage('storage-units-cocoa-beach-fl')!

describe('conformAllCityPage', () => {
  it('round-trips every imported page through the editor form unchanged', () => {
    for (const page of allSeedPages()) {
      assert.deepEqual(conformAllCityPage(toAllCityPageForm(page), page), page, page.slug)
    }
  })

  it('keeps the seed for an invalid field and never changes the slug', () => {
    const page = conformAllCityPage({ slug: 'other', depotKey: 'nowhere', state: 'ZZ', variant: 'x', h1: '  ', redirectTo: 'Not A Slug!' }, cocoa)
    assert.equal(page.slug, cocoa.slug)
    assert.equal(page.depotKey, cocoa.depotKey)
    assert.equal(page.state, cocoa.state)
    assert.equal(page.variant, cocoa.variant)
    assert.equal(page.h1, cocoa.h1)
    assert.equal(page.redirectTo, undefined)
  })

  it('stores empty optional fields as absent, and only filled wording overrides', () => {
    const page = conformAllCityPage(
      { hidden: false, redirectTo: '', keywordHeading: ' ', seo: { ...cocoa.seo, canonical: '', keywords: [], focusKeyphrase: '' }, text: { introHeading: 'Near {city}', whyHeading: '', steps: [] } },
      cocoa,
    )
    assert.deepEqual(page.text, { introHeading: 'Near {city}' })
    assert.equal('hidden' in page, false)
    assert.equal('redirectTo' in page, false)
    assert.equal('keywordHeading' in page, false)
    assert.deepEqual(Object.keys(page.seo).sort(), ['description', 'title'])
  })

  it('takes a redirect, a canonical, a focus keyphrase and keywords', () => {
    const page = conformAllCityPage(
      { redirectTo: 'storage-units-longmont-co', seo: { ...cocoa.seo, canonical: 'https://onsitestorage.com/all-city/x', focusKeyphrase: '  storage units  cocoa beach ', keywords: ['a', 'a', 'b'] } },
      cocoa,
    )
    assert.equal(page.redirectTo, 'storage-units-longmont-co')
    assert.equal(page.seo.canonical, 'https://onsitestorage.com/all-city/x')
    assert.equal(page.seo.focusKeyphrase, 'storage units cocoa beach')
    assert.deepEqual(page.seo.keywords, ['a', 'b'])
  })

  it('drops a redirect to the page itself', () => {
    assert.equal(conformAllCityPage({ redirectTo: cocoa.slug }, cocoa).redirectTo, undefined)
  })
})

describe('conformAllCityTemplate', () => {
  it('returns the default for nothing stored', () => {
    assert.deepEqual(conformAllCityTemplate(undefined), ALL_CITY_TEMPLATE_DEFAULT)
  })

  it('takes wording, keeps the default for a bad link, image or empty steps', () => {
    const t = conformAllCityTemplate({
      city: { introHeading: 'Containers in {city}', steps: [] },
      media: { heroBackground: 'https://evil.example.com/x.webp', youtubeId: 'https://www.youtube.com/watch?v=abcdefghijk' },
    })
    assert.equal(t.city.introHeading, 'Containers in {city}')
    assert.deepEqual(t.city.steps, ALL_CITY_TEMPLATE_DEFAULT.city.steps)
    assert.equal(t.media.heroBackground, ALL_CITY_TEMPLATE_DEFAULT.media.heroBackground)
    assert.equal(t.media.youtubeId, 'abcdefghijk')
  })

  it('gives a template saved before the redesigned sections their defaults, and checks their shape', () => {
    // A template as stored before 2026-11-18: no sections, and the old hero fields.
    const old = conformAllCityTemplate({ city: { heroBody: 'old', introHeading: 'Kept' } })
    assert.deepEqual(old.sections, ALL_CITY_TEMPLATE_DEFAULT.sections)
    assert.equal(old.city.introHeading, 'Kept')
    assert.equal('heroBody' in old.city, false)

    const t = conformAllCityTemplate({
      sections: {
        breadcrumbs: { home: 'Start', state: 42 },
        hero: { badge: '', stats: [{ value: '9', label: 'Nine' }, 'junk', { value: 1 }], quote: { button: 'Send' } },
      },
    })
    assert.equal(t.sections.breadcrumbs.home, 'Start')
    assert.equal(t.sections.breadcrumbs.state, ALL_CITY_TEMPLATE_DEFAULT.sections.breadcrumbs.state)
    assert.equal(t.sections.hero.badge, '')
    assert.equal(t.sections.hero.heading, '{h1}')
    // A bad item is dropped; an item missing a field takes the seed item's.
    assert.deepEqual(t.sections.hero.stats, [
      { value: '9', label: 'Nine' },
      { value: ALL_CITY_TEMPLATE_DEFAULT.sections.hero.stats[0].value, label: ALL_CITY_TEMPLATE_DEFAULT.sections.hero.stats[0].label },
    ])
    assert.equal(t.sections.hero.quote.button, 'Send')
    assert.equal(t.sections.hero.quote.heading, ALL_CITY_TEMPLATE_DEFAULT.sections.hero.quote.heading)
  })

  it('container cards: an unknown listing is dropped, a bad link keeps the default', () => {
    const t = conformAllCityTemplate({
      sections: {
        products: {
          cards: [{ spec: 'used_20s_wwt', title: 'Twenty' }, { spec: 'bogus', title: 'Nope' }, 'junk', { spec: 'new_40h_iicl' }],
          buttonHref: 'javascript:alert(1)',
        },
      },
    })
    assert.deepEqual(
      t.sections.products.cards.map((c) => [c.spec, c.title]),
      [['used_20s_wwt', 'Twenty'], ['new_40h_iicl', ALL_CITY_TEMPLATE_DEFAULT.sections.products.cards[0].title]],
    )
    assert.equal(t.sections.products.buttonHref, ALL_CITY_TEMPLATE_DEFAULT.sections.products.buttonHref)
    // An empty list is allowed (no cards); no list keeps the default four.
    assert.deepEqual(conformAllCityTemplate({ sections: { products: { cards: [] } } }).sections.products.cards, [])
    assert.deepEqual(conformAllCityTemplate({ sections: {} }).sections.products.cards, ALL_CITY_TEMPLATE_DEFAULT.sections.products.cards)
  })

  it('Trusted By: an on/off must be a boolean, the heading text', () => {
    const t = conformAllCityTemplate({ sections: { trustedBy: { show: false, heading: 'Trusted by' } } })
    assert.deepEqual(t.sections.trustedBy, { show: false, heading: 'Trusted by' })
    assert.equal(conformAllCityTemplate({ sections: { trustedBy: { show: 'no' } } }).sections.trustedBy.show, true)
  })

  it('Buy / Rent / Rent-To-Own: known kinds once each, known icons, safe links', () => {
    const base = ALL_CITY_TEMPLATE_DEFAULT.sections.offers.tabs
    const t = conformAllCityTemplate({
      sections: {
        offers: {
          tabs: [
            { ...base[1], card: { ...base[1].card, href: 'javascript:alert(1)' }, features: [{ icon: 'rocket', title: 'X', text: 'Y' }] },
            { ...base[0], id: 'lease' },
            base[1],
            base[0],
          ],
        },
      },
    })
    assert.deepEqual(t.sections.offers.tabs.map((tab) => tab.id), ['rent', 'buy'])
    assert.equal(t.sections.offers.tabs[0].card.href, base[1].card.href)
    assert.equal(t.sections.offers.tabs[0].features[0].icon, 'price')
    assert.deepEqual(conformAllCityTemplate({ sections: {} }).sections.offers, ALL_CITY_TEMPLATE_DEFAULT.sections.offers)
  })

  it('How It Works: the button goes to {depotPlp}, {depotPage} or a safe link', () => {
    const at = (buttonHref: unknown) => conformAllCityTemplate({ sections: { howItWorks: { buttonHref } } }).sections.howItWorks.buttonHref
    assert.equal(at('{depotPage}'), '{depotPage}')
    assert.equal(at('{depotPlp}'), '{depotPlp}')
    assert.equal(at('/where-to-buy-shipping-containers'), '/where-to-buy-shipping-containers')
    assert.equal(at('javascript:alert(1)'), '{depotPlp}')
  })

  it('The Difference’s photo: blank (the depot’s banner), a site path or the CDN', () => {
    const at = (image: unknown) => conformAllCityTemplate({ sections: { difference: { image } } }).sections.difference.image
    assert.equal(at(''), '')
    assert.equal(at('/images/a.webp'), '/images/a.webp')
    assert.equal(at('https://evil.example.com/a.webp'), '')
  })

  it('Recently Delivered: 1 to 20 whole cards; a non-number keeps the default', () => {
    const at = (limit: unknown) => conformAllCityTemplate({ sections: { deliveries: { limit } } }).sections.deliveries.limit
    assert.equal(at(6), 6)
    assert.equal(at(0), 1)
    assert.equal(at(40), 20)
    assert.equal(at(2.6), 3)
    assert.equal(at('9'), ALL_CITY_TEMPLATE_DEFAULT.sections.deliveries.limit)
  })

  it('Popular Cities: 1 to 20 whole cities', () => {
    const at = (limit: unknown) => conformAllCityTemplate({ sections: { popular: { limit } } }).sections.popular.limit
    assert.equal(at(8), 8)
    assert.equal(at(0), 1)
    assert.equal(at(99), 20)
  })

  it('Get A Free Quote: points are text, at most six; the homepage’s words by default', () => {
    const t = conformAllCityTemplate({ sections: { quote: { points: ['One', 2, 'Three', 'a', 'b', 'c', 'd', 'e'] } } })
    assert.deepEqual(t.sections.quote.points, ['One', 'Three', 'a', 'b', 'c', 'd'])
    assert.deepEqual(conformAllCityTemplate({}).sections.quote, ALL_CITY_TEMPLATE_DEFAULT.sections.quote)
  })

  it('allows a blank video and a blank closing band', () => {
    const t = conformAllCityTemplate({ media: { youtubeId: '' }, depotCity: { offerBand: '' } })
    assert.equal(t.media.youtubeId, '')
    assert.equal(t.depotCity.offerBand, '')
  })
})

describe('conformAllCityDepot', () => {
  const houston = ALL_CITY_DEPOTS['houston-tx']

  it('round-trips every depot through the editor form unchanged', () => {
    for (const depot of Object.values(ALL_CITY_DEPOTS)) assert.deepEqual(conformAllCityDepot(toAllCityDepotForm(depot), depot), depot, depot.key)
  })

  it('keeps the seed for an unknown location page or a non-CDN banner; ignores the old card lists', () => {
    const d = conformAllCityDepot(
      { key: 'x', locationSlug: 'nowhere', banner: { src: 'https://example.com/a.jpg', width: 1, height: 1 }, specs: ['new_20s_iicl'] },
      houston,
    )
    assert.equal(d.key, 'houston-tx')
    assert.equal(d.locationSlug, houston.locationSlug)
    assert.deepEqual(d.banner, houston.banner)
    assert.equal('specs' in d, false)
  })

  it('a cleared depot-city banner means "use the city page’s"', () => {
    const d = conformAllCityDepot({ depotCityBanner: null }, houston)
    assert.equal('depotCityBanner' in d, false)
  })

  it('images: a site path or the CDN only', () => {
    assert.equal(imageSrc('/images/a.webp'), '/images/a.webp')
    assert.ok(imageSrc('https://onsite-cdn.sfo3.cdn.digitaloceanspaces.com/a.jpg'))
    assert.equal(imageSrc('https://example.com/a.jpg'), undefined)
    assert.equal(imageSrc('//example.com/a.jpg'), undefined)
  })
})

describe('bulk edits and filters', () => {
  it('applies only what the change names', () => {
    const next = applyAllCityBulkChange(cocoa, { popular: true, noindex: true, replace: { field: 'title', find: 'Lowest Price', with: 'Best Price' } })
    assert.equal(next.lists.popular, true)
    assert.equal(next.lists.viewAll, cocoa.lists.viewAll)
    assert.equal(next.seo.noindex, true)
    assert.equal(next.seo.title, 'Storage Units Cocoa Beach FL | Best Price Shipping Containers')
    assert.equal(next.h1, cocoa.h1)
    assert.equal(cocoa.lists.popular, false, 'the original is not changed')
  })

  it('filters by state, depot, list, status and text', () => {
    const row = { page: cocoa, status: 'seed' as const, hasDraft: false, issues: [] }
    assert.equal(matchesAllCityFilter(row, { state: 'FL', depot: 'miami-fl', list: 'viewAll', q: 'cocoa' }), true)
    assert.equal(matchesAllCityFilter(row, { state: 'TX' }), false)
    assert.equal(matchesAllCityFilter(row, { list: 'popular' }), false)
    assert.equal(matchesAllCityFilter(row, { show: 'draft' }), false)
    assert.equal(matchesAllCityFilter({ ...row, hasDraft: true }, { show: 'edited' }), true)
  })
})

describe('findAllCityIssues on the import', () => {
  const issues = findAllCityIssues(allSeedPages())
  const kinds = (slug: string) => (issues.get(slug) ?? []).map((issue) => issue.kind)

  it('finds the WordPress copies and same-city pairs', () => {
    assert.ok(kinds('storage-units-longmont-co-2').includes('copySlug'))
    assert.ok(kinds('storage-units-longmont-co').includes('sameCity'))
    assert.deepEqual(issues.get('storage-units-elyria-oh')?.find((i) => i.kind === 'sameCity')?.twins, ['storage-units-elyria-ohio'])
  })

  it('finds an h1 naming another city, and h1s without the city', () => {
    assert.ok(kinds('shipping-containers-hamlin-tx').includes('h1OtherCity'))
    assert.ok(kinds('shipping-containers-wrens-ga').includes('h1NoCity'))
    assert.ok(kinds('shipping-containers-wrens-ga').includes('noDescription'))
  })

  it('leaves a clean page alone, and resolved (hidden) pages out', () => {
    assert.equal(issues.has('storage-units-cocoa-beach-fl'), false)
    const copy = getSeedPage('storage-units-longmont-co-2')!
    const resolved = findAllCityIssues([...allSeedPages().filter((p) => p.slug !== copy.slug), { ...copy, hidden: true }])
    assert.equal(resolved.has(copy.slug), false)
  })
})
