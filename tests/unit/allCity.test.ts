// The four native /all-city/ pages: records against WordPress (read
// 2026-11-13), the route claims, the SEO defaults and the extracted city lists.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const { ALL_CITY_PAGES } = await import('@/lib/data/allCityPages')
const { ALL_CITY_PAGE_SLUGS } = await import('@/lib/data/allCityPageSlugs')
const { ALL_CITY_LISTS } = await import('@/lib/data/allCityLists')
const { LOCATION_PAGE_SLUGS } = await import('@/lib/data/locationPageSlugs')
const { PAGE_SEO_DEFAULTS } = await import('@/config/pageSeoDefaults')
const { NATIVE_PAGES } = await import('@/config/pages')
const { isDepotFeaturedKey } = await import('@/services/search.service')
const { isNativePath, ROUTES } = await import('@/config/routes')

const pages = Object.values(ALL_CITY_PAGES)

describe('/all-city/ pages', () => {
  it('the slug list matches the records', () => {
    assert.deepEqual([...ALL_CITY_PAGE_SLUGS].sort(), Object.keys(ALL_CITY_PAGES).sort())
  })

  it('claims exactly the four paths, not the rest of /all-city/', () => {
    for (const slug of ALL_CITY_PAGE_SLUGS) assert.equal(isNativePath(ROUTES.ALL_CITY(slug)), true, slug)
    assert.equal(isNativePath(ROUTES.ALL_CITY('storage-units-boca-raton')), false)
  })

  it('carries WordPress’s title and description as absolute SEO defaults', () => {
    for (const page of pages) {
      const seo = PAGE_SEO_DEFAULTS[ROUTES.ALL_CITY(page.slug)]
      assert.equal(seo.title, page.seoTitle)
      assert.equal(seo.absoluteTitle, true)
      assert.equal(seo.description, page.seoDescription)
      assert.equal(seo.canonical, ROUTES.ALL_CITY(page.slug))
      assert.ok(NATIVE_PAGES.some((native) => native.path === ROUTES.ALL_CITY(page.slug)), `${page.slug} not in the Page Configurator`)
    }
  })

  it('uses depots with a native location page and featured specs the search knows', () => {
    for (const page of pages) {
      assert.ok(LOCATION_PAGE_SLUGS.includes(page.depot.locationSlug), page.slug)
      assert.equal(page.depot.specs.length, 4)
      for (const spec of page.depot.specs) assert.ok(isDepotFeaturedKey(spec), `${page.slug}: ${spec}`)
    }
  })

  it('has the city lists WordPress shows (counted on the live pages)', () => {
    // WordPress leaves the page itself out: Cocoa Beach shows 492 of Florida's 493, Abbott 1,436 of Texas's 1,437.
    assert.equal(ALL_CITY_LISTS.FL?.popular.length, 20)
    assert.equal(ALL_CITY_LISTS.FL?.viewAll.filter(([slug]) => slug !== 'storage-units-cocoa-beach-fl').length, 492)
    assert.equal(ALL_CITY_LISTS.TX?.popular.length, 17)
    assert.equal(ALL_CITY_LISTS.TX?.viewAll.filter(([slug]) => slug !== 'abbott-shipping-containers').length, 1436)
    assert.equal(ALL_CITY_LISTS.FL?.popular[0][1], 'Boca Raton')
    for (const page of pages) assert.ok(ALL_CITY_LISTS[page.depot.state], `${page.depot.state} lists missing`)
  })
})
