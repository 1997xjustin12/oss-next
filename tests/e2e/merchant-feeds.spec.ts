import { test, expect } from '@playwright/test'
import { MERCHANT_FEED_SOURCES } from '../../config/merchantFeeds'

/**
 * The Google Merchant feeds answer at their old WordPress URLs, and only someone
 * allowed can start a run. Nothing is generated here: the local server has no Blob
 * store, so a feed answers 503, which still shows the URL reaches the feed route
 * rather than the proxy's 404 for a missing WordPress page. The content is covered
 * by tests/unit/merchantFeed.test.ts.
 */

test.describe('merchant feeds', () => {
  for (const { label, path, source } of MERCHANT_FEED_SOURCES) {
    test(`${label}: the old URL reaches the feed`, async ({ request }) => {
      const [old, direct] = await Promise.all([request.get(path), request.get(`/api/feeds/merchant/${source}`)])
      expect([200, 503]).toContain(old.status())
      expect(old.status()).toBe(direct.status())
      if (old.status() === 200) expect(await old.text()).toContain('<rss')
      else expect(await old.text()).toContain('not been generated')
    })
  }

  test('an unknown feed is a 404', async ({ request }) => {
    expect((await request.get('/api/feeds/merchant/nope')).status()).toBe(404)
  })

  test('a run cannot be started without a secret or an admin session', async ({ request }) => {
    expect((await request.get('/api/feeds/generate')).status()).toBe(401)
    expect((await request.post('/api/feeds/generate')).status()).toBe(401)
    expect((await request.post('/api/feeds/generate', { headers: { authorization: 'Bearer undefined' } })).status()).toBe(401)
  })

  test('the admin screen is a 404 without an admin session, as every admin path', async ({ request }) => {
    const res = await request.get('/admin/product-feeds', { headers: { host: 'not-local.example.com' } })
    expect(res.status()).toBe(404)
  })
})
