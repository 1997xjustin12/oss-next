// Old URLs outside /all-city/ that 301 to an /all-city/ page (2026-11-23):
// the rules the editor, the Server Actions and the proxy share, the default
// list, and the proxy's cached lookup.
import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

mock.module('next/cache', { namedExports: { cacheLife: () => {}, cacheTag: () => {} } })

let stored: unknown = null
let reads = 0
mock.module('@/lib/redis', {
  namedExports: {
    getRedisClient: () => ({
      get: async () => {
        reads++
        if (stored instanceof Error) throw stored
        return stored
      },
    }),
  },
})

const { checkAllCityOldUrls, normalizeAllCityTarget, normalizeOldUrl } = await import('@/lib/allCityOldUrls')
const { ALL_CITY_OLD_URLS_DEFAULT } = await import('@/lib/data/allCityOldUrls')
const { getSeedPage } = await import('@/lib/allCitySeed')
const { ALL_CITY_OLD_URLS_KEY, allCityOldUrlTarget, forgetAllCityOldUrls } = await import('@/lib/allCityOldUrlRedirects')
const { allCityKey } = await import('@/services/allCity.service')

describe('old URL rules', () => {
  it('takes a pasted link, a bare slug or a messy path as one clean path', () => {
    for (const input of ['https://old.onsitestorage.com/storage-kennesaw/', 'storage-kennesaw', '/Storage-Kennesaw?utm=x', ' /storage-kennesaw// ']) {
      assert.equal(normalizeOldUrl(input), '/storage-kennesaw', input)
    }
    for (const input of ['', '/', 'https://x.test', '/a b', 42, null]) assert.equal(normalizeOldUrl(input), null, String(input))
  })

  it('takes the new page as a slug, an /all-city/ path or a full link', () => {
    for (const input of ['storage-kennesaw', '/all-city/storage-kennesaw', 'https://onsitestorage.com/all-city/storage-kennesaw/']) {
      assert.equal(normalizeAllCityTarget(input), 'storage-kennesaw', input)
    }
    assert.equal(normalizeAllCityTarget('/all-city/a/b'), null)
  })

  it('refuses /all-city/ itself, the site’s own routes and duplicates; drops blank rows', () => {
    const { rows, errors } = checkAllCityOldUrls([
      { from: '/old-page', to: 'storage-kennesaw' },
      { from: '', to: '' },
      { from: '/all-city/x', to: 'storage-kennesaw' },
      { from: '/where-to-buy-shipping-containers/atlanta-ga', to: 'storage-kennesaw' },
      { from: '/admin', to: 'storage-kennesaw' },
      { from: '/Old-Page/', to: 'storage-kennesaw' },
      { from: '/another', to: 'not a slug!' },
    ])
    assert.deepEqual(rows, [{ from: '/old-page', to: 'storage-kennesaw' }])
    assert.equal(errors.length, 5, errors.join('\n'))
    assert.match(errors.join('\n'), /Row 6: \/old-page is already on row 1/)
  })
})

describe('the default list', () => {
  it('passes the rules, once per old URL, each to a live seed page', () => {
    const { rows, errors } = checkAllCityOldUrls(ALL_CITY_OLD_URLS_DEFAULT)
    assert.deepEqual(errors, [])
    assert.equal(rows.length, ALL_CITY_OLD_URLS_DEFAULT.length)
    assert.equal(rows.length, 58)
    for (const row of rows) {
      const page = getSeedPage(row.to)
      assert.ok(page && !page.hidden && !page.redirectTo, `${row.from} → ${row.to}`)
    }
  })
})

describe('the proxy lookup', () => {
  it('reads the same key the admin writes', () => {
    assert.equal(ALL_CITY_OLD_URLS_KEY, allCityKey('redirects'))
  })

  it('uses the default with no record, the published list once there is one, and caches for a minute', async () => {
    forgetAllCityOldUrls()
    reads = 0
    assert.equal(await allCityOldUrlTarget('/storage-kennesaw', 1_000), 'storage-kennesaw')
    assert.equal(await allCityOldUrlTarget('/storage-kennesaw/', 2_000), 'storage-kennesaw')
    assert.equal(reads, 1)

    stored = { data: [{ from: '/brand-new-old-url', to: 'storage-kennesaw' }], updatedAt: '', updatedBy: '' }
    assert.equal(await allCityOldUrlTarget('/brand-new-old-url', 30_000), null, 'still the cached list')
    assert.equal(await allCityOldUrlTarget('/brand-new-old-url', 62_000), 'storage-kennesaw')
    assert.equal(await allCityOldUrlTarget('/storage-kennesaw', 62_000), null, 'the published list replaces the default')
  })

  it('keeps the last list when Redis fails', async () => {
    stored = new Error('down')
    assert.equal(await allCityOldUrlTarget('/brand-new-old-url', 200_000), 'storage-kennesaw')
    stored = null
  })
})
