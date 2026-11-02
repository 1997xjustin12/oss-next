import { test, expect, type Page } from '@playwright/test'

/**
 * The Zoho SalesIQ chat: on the storefront, except the pages excluded in
 * config/salesIq.ts. Checks the app's half (whether it loads and is switched on),
 * so these don't depend on Zoho answering.
 */

const snippet = (page: Page) => page.locator('script#zsiqchat')
const switchedOn = (page: Page) => page.locator('html[data-salesiq="on"]')

test.describe('SalesIQ chat', () => {
  test('loads on a storefront page', async ({ page }) => {
    await page.goto('/where-to-buy-shipping-containers')
    await expect(snippet(page)).toHaveCount(1, { timeout: 30_000 })
    await expect(switchedOn(page)).toHaveCount(1)
  })

  for (const path of ['/cart', '/checkout']) {
    test(`does not load on ${path}`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('load')
      await page.waitForTimeout(3_000)
      await expect(snippet(page)).toHaveCount(0)
      await expect(switchedOn(page)).toHaveCount(0)
    })
  }

  test('does not load on a GBP location page', async ({ page }) => {
    await page.goto('/shipping-containers-for-sale-in-newark-nj')
    await page.waitForLoadState('load')
    await page.waitForTimeout(3_000)
    await expect(snippet(page)).toHaveCount(0)
  })
})

test.describe('SalesIQ chat list', () => {
  test('the list is public and the admin screen is a 404 without an admin session', async ({ request }) => {
    const res = await request.get('/api/live-chat')
    expect(res.status()).toBe(200)
    expect(Array.isArray((await res.json()).excludedPaths)).toBe(true)

    const admin = await request.get('/admin/live-chat', { headers: { host: 'not-local.example.com' } })
    expect(admin.status()).toBe(404)
  })

  test('a page added to the list loses the chat', async ({ page }) => {
    await page.route('**/api/live-chat', (route) => route.fulfill({ json: { excludedPaths: ['/where-to-buy-shipping-containers'] } }))
    await page.goto('/where-to-buy-shipping-containers')
    await page.waitForLoadState('load')
    await page.waitForTimeout(3_000)
    await expect(snippet(page)).toHaveCount(0)
    await expect(switchedOn(page)).toHaveCount(0)
  })

  test('if the list cannot be fetched, the cart still leaves it out and other pages keep it', async ({ page }) => {
    await page.route('**/api/live-chat', (route) => route.abort())
    await page.goto('/cart')
    await page.waitForLoadState('load')
    await page.waitForTimeout(3_000)
    await expect(snippet(page)).toHaveCount(0)

    await page.goto('/where-to-buy-shipping-containers')
    await expect(snippet(page)).toHaveCount(1, { timeout: 30_000 })
  })
})

test.describe('third-party scripts wait for the visitor', () => {
  test('Zoho loads on the first interaction, not before', async ({ page }) => {
    await page.goto('/where-to-buy-shipping-containers')
    await page.waitForLoadState('load')
    await expect(snippet(page)).toHaveCount(1, { timeout: 30_000 })
    await expect(page.locator('script#zsiqscript')).toHaveCount(0)

    await page.mouse.wheel(0, 300)
    await expect(page.locator('script#zsiqscript')).toHaveCount(1, { timeout: 10_000 })
  })

  test('and on the timer for a visitor who does nothing', async ({ page }) => {
    await page.goto('/where-to-buy-shipping-containers')
    await expect(page.locator('script#zsiqscript')).toHaveCount(1, { timeout: 20_000 })
  })
})

test.describe('listing results', () => {
  test('are in the HTML, and the first search needs no request', async ({ page, request }) => {
    const html = await (await request.get('/sale-shipping-containers')).text()
    expect(html.match(/<article/g)?.length ?? 0).toBeGreaterThanOrEqual(12)

    const searches: string[] = []
    page.on('request', (r) => { if (r.url().includes('/api/search')) searches.push(r.url()) })
    await page.goto('/sale-shipping-containers')
    await expect(page.locator('article:visible').first()).toBeVisible()
    await page.waitForLoadState('load')
    await page.waitForTimeout(2_000)
    expect(searches).toHaveLength(0)
  })

  test('still change when the visitor searches', async ({ page }) => {
    await page.goto('/sale-shipping-containers')
    await page.waitForLoadState('load')
    const first = page.locator('article:visible h2').first()
    const before = await first.innerText()
    await page.getByPlaceholder(/Search containers/).filter({ visible: true }).first().fill('40ft high cube')
    await expect(first).not.toHaveText(before, { timeout: 30_000 })
  })
})
