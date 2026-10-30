import { test, expect } from '@playwright/test'

/**
 * Checkout is open on every domain (lib/paymentRedirect.ts). Admin → Checkout
 * now decides only whether a placed order goes on to the payment page, which
 * the order route settles on the server (unit-tested in paymentRedirect.test.ts).
 *
 * Until 2026-10-30 an unlisted domain was sent to /checkout-unavailable and its
 * orders refused. 127.0.0.1 is the same server under a domain nobody listed, so
 * these check that gate is gone.
 */

const UNLISTED_ORIGIN = 'http://127.0.0.1:3000'

test.describe('checkout on a domain without the payment page', () => {
  test('checkout renders', async ({ page }) => {
    await page.goto(`${UNLISTED_ORIGIN}/checkout`)
    await expect(page).toHaveURL(/\/checkout$/)
  })

  test('the order API takes the request (an empty one is refused as invalid, not as closed)', async ({ request }) => {
    const res = await request.post(`${UNLISTED_ORIGIN}/api/checkout/place-order`, { data: {} })
    expect(res.status()).toBe(400)
    expect(await res.json()).toMatchObject({ ok: false, stage: 'validation' })
  })

  test('the old "checkout unavailable" page is gone', async ({ request }) => {
    const res = await request.get(`${UNLISTED_ORIGIN}/checkout-unavailable`)
    expect(res.status()).toBe(404)
  })
})
