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
