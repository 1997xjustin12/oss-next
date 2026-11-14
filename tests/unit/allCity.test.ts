// The /all-city/[slug] pages: the imported seed, the depot table, the template
// wording and each state's lists, checked against what WordPress showed
// (counted on the live pages 2026-11-13; docs/reference/all-city-pages.md).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const { ALL_CITY_FLAGS, allSeedPages, decodeRow, getSeedPage, seedSlugs } = await import('@/lib/allCitySeed')
const { allCityDepotParts, allCityOtherHref, allCityVars, buildAllCityLists, isListable, resolveAllCityText, withoutPage } = await import('@/lib/allCityPage')
const { ALL_CITY_DEPOTS } = await import('@/lib/data/allCityDepots')
const { ALL_CITY_TEMPLATE_DEFAULT } = await import('@/lib/data/allCityTemplate')
const { LOCATION_PAGE_SLUGS } = await import('@/lib/data/locationPageSlugs')
const { isDepotFeaturedKey } = await import('@/services/search.service')
const { isNativePath, ROUTES } = await import('@/config/routes')

describe('decodeRow', () => {
  const tables = { titleEndings: ['Best Prices'], descriptionTails: ['Call us now!'] }

  it('rebuilds a compressed title and description', () => {
    const page = decodeRow(['a-b', 'B', 'Storage B', 0, ['Storage b', 0], 'miami-fl', ALL_CITY_FLAGS.popular], tables)
    assert.equal(page.seo.title, 'Storage B | Best Prices')
    assert.equal(page.seo.description, 'Storage b. Call us now!')
    assert.equal(page.variant, 'city')
    assert.equal(page.state, 'FL')
    assert.deepEqual(page.lists, { popular: true, viewAll: false })
  })

  it('keeps whole values, the depot-city flag, the keyword and a state override', () => {
    const flags = ALL_CITY_FLAGS.depotCity | ALL_CITY_FLAGS.noindex | ALL_CITY_FLAGS.viewAll
    const page = decodeRow(['x', 'X', 'X', 'Own title', 'Own description', 'baltimore-md', flags, 'Keyword X', 'IL'], tables)
    assert.equal(page.seo.title, 'Own title')
    assert.equal(page.seo.description, 'Own description')
    assert.equal(page.variant, 'depotCity')
    assert.equal(page.seo.noindex, true)
    assert.equal(page.keywordHeading, 'Keyword X')
    assert.equal(page.state, 'IL')
  })
})

describe('the seed', () => {
  const pages = allSeedPages()

  it('has every WordPress page that has a template, once', () => {
    // 8,541 posts, less the two with no tags (no template on WordPress).
    assert.equal(pages.length, 8539)
    assert.equal(new Set(seedSlugs()).size, pages.length)
  })

  it('decodes every row to a complete page on a defined depot', () => {
    for (const page of pages) {
      // A description may be empty: five Georgia pages have none on WordPress (the
      // issues report lists them, for the configurator).
      assert.ok(page.city && page.h1 && page.seo.title, page.slug)
      assert.ok(!/undefined/.test(page.seo.title + page.seo.description), page.slug)
      assert.ok(ALL_CITY_DEPOTS[page.depotKey], `${page.slug}: depot ${page.depotKey}`)
      assert.ok(page.state, `${page.slug}: no state`)
      if (page.variant === 'depotCity') assert.ok(page.keywordHeading, `${page.slug}: no keyword heading`)
    }
  })

  it('has the 23 depot-city pages and the 16 noindex pages', () => {
    assert.equal(pages.filter((p) => p.variant === 'depotCity').length, 23)
    assert.equal(pages.filter((p) => p.seo.noindex).length, 16)
  })

  it('matches the four pages migrated first', () => {
    const cocoa = getSeedPage('storage-units-cocoa-beach-fl')!
    assert.equal(cocoa.city, 'Cocoa Beach')
    assert.equal(cocoa.h1, 'Storage Units Cocoa Beach FL')
    assert.equal(cocoa.seo.title, 'Storage Units Cocoa Beach FL | Lowest Price Shipping Containers')
    assert.equal(
      cocoa.seo.description,
      'Storage units Cocoa Beach FL. Lowest price guaranteed. Sturdy and reliable containers. Huge range of sizes and grades. Call us now!',
    )
    assert.equal(cocoa.depotKey, 'miami-fl')
    assert.equal(getSeedPage('abbeville-storage-unit')!.h1, 'Abbeville Storage Unit')
    assert.equal(getSeedPage('abbott-shipping-containers')!.seo.title, 'Abbott Shipping Containers | Best Prices & Fast Delivery')
    assert.equal(getSeedPage('acme-storage-container')!.depotKey, 'detroit-mi')
  })
})

describe('the depots', () => {
  it('lists the same keys as the import script', () => {
    const script = readFileSync(new URL('../../scripts/archive-all-city-pages.mjs', import.meta.url), 'utf8')
    const block = script.match(/const DEPOT_KEYS = new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? ''
    assert.deepEqual([...block.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]).sort(), Object.keys(ALL_CITY_DEPOTS).sort())
  })

  it('each has a native location page and four known product specs', () => {
    for (const depot of Object.values(ALL_CITY_DEPOTS)) {
      assert.ok(LOCATION_PAGE_SLUGS.includes(depot.locationSlug), `${depot.key}: ${depot.locationSlug}`)
      assert.equal(depot.specs.length, 4, depot.key)
      for (const spec of [...depot.specs, ...(depot.depotCitySpecs ?? [])]) assert.ok(isDepotFeaturedKey(spec), `${depot.key}: ${spec}`)
    }
  })
})

describe('the lists, against WordPress', () => {
  const seed = allSeedPages()
  const getAllCityLists = async (state: Parameters<typeof buildAllCityLists>[1], slug: string) => withoutPage(buildAllCityLists(seed, state), slug)

  it('Cocoa Beach: 20 popular, 492 in Florida’s view-all, itself left out', async () => {
    const lists = await getAllCityLists('FL', 'storage-units-cocoa-beach-fl')
    assert.equal(lists.popular.length, 20)
    assert.equal(lists.popular[0].city, 'Boca Raton')
    assert.equal(lists.viewAll.length, 492)
  })

  it('Abbott 17 / 1,436 (Texas), Abbeville 20 / 608 (Georgia), Acme 20 / 861 (Michigan)', async () => {
    assert.deepEqual(
      [await getAllCityLists('TX', 'abbott-shipping-containers'), await getAllCityLists('GA', 'abbeville-storage-unit'), await getAllCityLists('MI', 'acme-storage-container')].map(
        (l) => [l.popular.length, l.viewAll.length],
      ),
      [
        [17, 1436],
        [20, 608],
        [20, 861],
      ],
    )
  })

  it('a popular city is left out of its own list', async () => {
    const lists = await getAllCityLists('FL', 'storage-units-boca-raton')
    assert.equal(lists.popular.length, 19)
  })

  it('hidden and redirected pages leave the lists', () => {
    assert.equal(isListable({ hidden: true }), false)
    assert.equal(isListable({ redirectTo: 'x' }), false)
    assert.equal(isListable({}), true)
  })
})

describe('the template', () => {
  const cocoa = getSeedPage('storage-units-cocoa-beach-fl')!

  it('fills every placeholder but {phone}, which the renderer makes a call link', () => {
    for (const variant of ['city', 'depotCity'] as const) {
      const text = resolveAllCityText(ALL_CITY_TEMPLATE_DEFAULT, { ...cocoa, variant })
      const left = JSON.stringify(text).match(/\{(\w+)\}/g) ?? []
      assert.deepEqual([...new Set(left)].filter((p) => p !== '{phone}'), [], variant)
    }
  })

  it('writes the city and state into the wording', () => {
    const text = resolveAllCityText(ALL_CITY_TEMPLATE_DEFAULT, cocoa)
    assert.equal(text.introHeading, 'Shipping Storage Containers in Cocoa Beach')
    assert.equal(text.stepsHeading, 'BUY A SHIPPING CONTAINER IN COCOA BEACH')
    assert.equal(text.popularHeading, 'Popular Cities in Florida')
    assert.deepEqual(allCityVars(cocoa), { city: 'Cocoa Beach', CITY: 'COCOA BEACH', state: 'Florida', ST: 'FL' })
  })

  it('lays a page’s own wording over the template; a blank override keeps the template’s', () => {
    const text = resolveAllCityText(ALL_CITY_TEMPLATE_DEFAULT, { ...cocoa, text: { introHeading: 'Containers near {city}', whyHeading: '  ' } })
    assert.equal(text.introHeading, 'Containers near Cocoa Beach')
    assert.equal(text.whyHeading, 'WHY CHOOSE ON-SITE STORAGE SOLUTIONS?')
  })

  it('takes the depot-city variant’s banner, cards and link where the depot has them', () => {
    const houston = ALL_CITY_DEPOTS['houston-tx']
    assert.deepEqual(allCityDepotParts(houston, { variant: 'depotCity' }).specs, houston.depotCitySpecs)
    assert.deepEqual(allCityDepotParts(houston, { variant: 'city' }).specs, houston.specs)
    const depotCityText = resolveAllCityText(ALL_CITY_TEMPLATE_DEFAULT, { ...cocoa, variant: 'depotCity' })
    assert.equal(allCityOtherHref(depotCityText, houston), ROUTES.WHERE_TO_BUY)
    assert.equal(allCityOtherHref(resolveAllCityText(ALL_CITY_TEMPLATE_DEFAULT, cocoa), houston), houston.otherPricesHref)
  })
})

describe('routing', () => {
  it('claims every /all-city/ path as native', () => {
    assert.equal(isNativePath(ROUTES.ALL_CITY('storage-units-cocoa-beach-fl')), true)
    assert.equal(isNativePath(ROUTES.ALL_CITY('any-city-at-all')), true)
  })
})
