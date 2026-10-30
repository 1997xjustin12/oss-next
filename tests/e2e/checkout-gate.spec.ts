import { test, expect } from '@playwright/test'

/**
 * The checkout gate (lib/checkoutGate.ts): checkout is closed on every domain
 * not opened in Admin → Checkout.
 *
 * The e2e server opens `localhost` by CHECKOUT_OPEN_HOSTS (playwright.config.ts),
 * so the journeys can reach checkout. The same server reached as 127.0.0.1 is a
 * domain nobody opened, which is how these tests see the gate.
 */

const CLOSED_ORIGIN = 'http://127.0.0.1:3000'

test.describe('checkout gate', () => {
  test('closed: checkout shows the "not open yet" page, with the phone and the way back', async ({ page }) => {
    await page.goto(`${CLOSED_ORIGIN}/checkout`)
    await expect(page).toHaveURL(/\/checkout-unavailable$/)
    await expect(page.getByRole('heading', { name: 'Checkout isn’t open yet' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Call \(888\)/ })).toHaveAttribute('href', /^tel:\+?\d+$/)
    await expect(page.getByRole('link', { name: 'Back to cart' })).toHaveAttribute('href', '/cart')
  })

  test('closed: the order API refuses', async ({ request }) => {
    const res = await request.post(`${CLOSED_ORIGIN}/api/checkout/place-order`, { data: {} })
    expect(res.status()).toBe(403)
    expect(await res.json()).toMatchObject({ ok: false })
  })

  test('open: checkout renders on a domain that is open', async ({ page }) => {
    await page.goto('/checkout')
    await expect(page).toHaveURL(/\/checkout$/)
  })
})
