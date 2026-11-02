import { test, expect } from '@playwright/test'

/**
 * The homepage's "Find the right container" cards: the whole card is one link to
 * its listing, photo and text included, and the button inside it is not a second
 * link (a link can't hold another).
 */

test.describe('home featured container cards', () => {
  test('each card is one link, with no link nested inside it', async ({ page }) => {
    await page.goto('/')
    const cards = page.getByRole('link', { name: /Buy · Rent · Rent-To-Own/ })
    await expect(cards).toHaveCount(4)
    await expect(page.locator('a a')).toHaveCount(0)
  })

  test('clicking the photo goes to the listing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('load')
    const card = page.getByRole('link', { name: /Buy · Rent · Rent-To-Own/ }).first()
    const href = await card.getAttribute('href')
    await card.locator('img').click()
    await expect(page).toHaveURL(/\/sale-shipping-containers\?/)
    expect(new URL(page.url()).searchParams.get('size')).toBe(new URL(href!, page.url()).searchParams.get('size'))
  })
})
