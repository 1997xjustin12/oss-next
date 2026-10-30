import {
  test,
  expect,
  expectNoErrorScreen,
  autoDismissSaveCart,
  openListingFromHome,
  openFirstContainer,
  setZipOnProductPage,
  addToCartAndOpenCart,
  expectPricesFormatted,
} from './fixtures'

/**
 * A visitor who never logs in, from the homepage to checkout.
 *
 * A guest reaches checkout one of two ways, and both are covered:
 *
 *   A. cart → checkout → detoured to the quote form → submit → checkout
 *   B. product page → Save Quote → details given → cart → straight to checkout
 *
 * Both forms on the way (A's quote page, B's modal) are the Zoho quote form,
 * which sends to Zoho CRM through /api/zoho-quote and would create a real
 * Contact. The tests answer that request themselves (and check what was sent),
 * so neither has a side effect and both always run to the checkout page —
 * which is never submitted: no test here presses Place Order.
 */

const ZIP = '30303' // Atlanta: a depot with real stock
const OTHER_DEPOT_ZIP = '60601' // Chicago
const LEAD = { first: 'E2E', last: 'Test Visitor', email: 'e2e-test@example.com', phone: '(555) 010-0199' }

/**
 * Answers /api/zoho-quote in place of the server, so nothing reaches Zoho.
 * Refuses the first `refuse` sends, accepts the rest; returns what was sent.
 * 200 even for a refusal: the journey guard fails any 4xx/5xx, and the form
 * reads `ok`, so `{ ok: false }` is refused whatever the status.
 */
async function answerZohoQuote(page: import('@playwright/test').Page, refuse = 0) {
  const posts: Record<string, string>[] = []
  await page.route('**/api/zoho-quote', (route) => {
    posts.push(route.request().postDataJSON() as Record<string, string>)
    const refused = posts.length <= refuse
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(refused ? { ok: false, error: 'Zoho refused it (e2e).' } : { ok: true }),
    })
  })
  return posts
}

test.describe('guest', () => {
  test('route A — finds a container, and checkout detours to the quote form @mobile', async ({ page }) => {
    await autoDismissSaveCart(page)

    await test.step('home → listing', () => openListingFromHome(page))
    await test.step('listing → product', () => openFirstContainer(page))
    await test.step('give a ZIP', () => setZipOnProductPage(page, ZIP))

    await test.step('listing links now carry the location', async () => {
      const href = await page.locator('a[href*="sale-shipping-containers"]').first().getAttribute('href')
      expect(href).toContain(`zipcode=${ZIP}`)
      expect(href).toContain('location=')
    })

    await test.step('add to cart', () => addToCartAndOpenCart(page))

    await test.step('cart shows one container, priced properly', async () => {
      await expect(page.locator('main').getByRole('button', { name: 'Remove' })).toHaveCount(1)
      await expectPricesFormatted(page)
    })

    await test.step('checkout sends a guest with no details to the quote form', async () => {
      await page.locator('main a[href="/checkout"]').first().click()
      await expect(page).toHaveURL(/\/get-exact-delivery-quote/)
      await expectNoErrorScreen(page)
      await expect(page.locator('#firstName')).toBeVisible()
    })

    await test.step('submit the quote form: refused, then accepted → checkout, filled in', async () => {
      const posts = await answerZohoQuote(page, 1)
      await page.locator('#firstName').fill(LEAD.first)
      await page.locator('#lastName').fill(LEAD.last)
      await page.locator('#phone').fill(LEAD.phone)
      await page.locator('#email').fill(LEAD.email)
      await page.locator('#street').fill('123 Test Street')
      // The ZIP arrives filled from the one already given, and City and State
      // from the ZIP — only the street is ever blank here.
      await expect(page.locator('#zip')).toHaveValue(ZIP)
      await expect(page.locator('#city')).toHaveValue('Atlanta')
      await expect(page.locator('#state')).toHaveValue('GA')

      // Refused: the reason shows, the page stays, the button works again.
      const proceed = page.getByRole('button', { name: /Proceed with checkout/i })
      await proceed.click()
      // Within the form: Next's route announcer is an alert too.
      await expect(page.locator('#quote-details-form').getByRole('alert')).toHaveText('Zoho refused it (e2e).')
      await expect(page).toHaveURL(/\/get-exact-delivery-quote/)
      await expect(proceed).toBeEnabled()

      // Accepted: on to checkout, which is filled in from what was sent.
      await proceed.click()
      await expect(page).toHaveURL(/\/checkout/)
      expect(posts).toHaveLength(2)
      expect(posts[1]).toMatchObject({ firstName: LEAD.first, lastName: LEAD.last, street: '123 Test Street', zip: ZIP, city: 'Atlanta' })
      await expect(page.getByPlaceholder('First Name').first()).toHaveValue(LEAD.first)
      await expect(page.getByPlaceholder('Email Address').first()).toHaveValue(LEAD.email)
    })
  })

  test('route B — saves a quote, then reaches checkout with their details filled in @mobile', async ({ page }) => {
    await autoDismissSaveCart(page)

    await test.step('home → listing → product → ZIP', async () => {
      await openListingFromHome(page)
      await openFirstContainer(page)
      await setZipOnProductPage(page, ZIP)
    })

    await test.step('Save Quote → give details → see the quote', async () => {
      // The first send is refused, the second accepted; nothing reaches Zoho.
      const zohoPosts = await answerZohoQuote(page, 1)

      await page.getByRole('button', { name: /Save Quote/ }).first().click()
      const modal = page.locator('[role="dialog"]').filter({ has: page.locator('#guest-lead-title') })
      await expect(modal).toBeVisible()
      await modal.locator('#guest-first-name').fill(LEAD.first)
      await modal.locator('#guest-last-name').fill(LEAD.last)
      await modal.locator('#guest-email').fill(LEAD.email)
      await modal.locator('#guest-phone').fill(LEAD.phone)
      // The ZIP comes from the one given on the page, and City and State fill
      // in from it.
      await expect(modal.locator('#guest-zip')).toHaveValue(ZIP)
      await expect(modal.locator('#guest-city')).toHaveValue('Atlanta')
      await expect(modal.locator('#guest-state')).toHaveValue('GA')
      // A different ZIP is a different place: City and State follow it. Near
      // enough to Atlanta to be priced (it re-prices delivery behind the modal).
      await modal.locator('#guest-zip').fill('30030')
      await expect(modal.locator('#guest-city')).toHaveValue('Decatur')
      await expect(modal.locator('#guest-state')).toHaveValue('GA')
      await modal.locator('#guest-zip').fill(ZIP)
      await expect(modal.locator('#guest-city')).toHaveValue('Atlanta')
      const detailsInert = modal.locator('[inert]').filter({ has: page.locator('#guest-first-name') })
      const stored = () =>
        page.evaluate(() => ({
          form: localStorage.getItem('oss-quote-form'),
          quotes: JSON.parse(localStorage.getItem('oss-saved-quotes') ?? '[]').length as number,
        }))
      const before = await stored()

      // Refused: the reason shows, the step stays, and nothing is saved.
      await modal.getByRole('button', { name: 'Get Quote' }).click()
      await expect(modal.getByRole('alert')).toHaveText('Zoho refused it (e2e).')
      await expect(detailsInert).toHaveCount(0)
      expect(await stored()).toEqual(before)

      // Accepted: on to the quote. Both steps stay in the page — the details
      // panel is only slid aside and made inert, so typed details survive a
      // step back. Moving on means that panel has gone inert, not that its
      // fields disappeared.
      await modal.getByRole('button', { name: 'Get Quote' }).click()
      await expect(detailsInert).toHaveCount(1)
      await expect(modal.getByRole('status')).toContainText('your details have been sent')
      await expectPricesFormatted(page, modal)

      // Sent with every field, and the honeypot empty, while the page stayed put.
      expect(zohoPosts).toHaveLength(2)
      expect(zohoPosts[1]).toMatchObject({
        firstName: LEAD.first,
        lastName: LEAD.last,
        email: LEAD.email,
        zip: ZIP,
        city: 'Atlanta',
        state: 'GA',
        aG9uZXlwb3Q: '',
      })
      expect(page.url()).toContain('/product/')

      // Kept in this browser for the next copy of the form, with the quote.
      const after = await stored()
      expect(JSON.parse(after.form ?? 'null')).toMatchObject({ firstName: LEAD.first, email: LEAD.email, zip: ZIP, city: 'Atlanta' })
      expect(after.quotes).toBe(before.quotes + 1)

      await page.keyboard.press('Escape')
      await expect(modal).toBeHidden()
    })

    await test.step('add to cart', () => addToCartAndOpenCart(page))

    // Changed 2026-09-24: a guest goes through the quote form on every order,
    // not just their first. The form is prefilled from what they gave the
    // modal, which is what makes always showing it cheap — so this step checks
    // the prefill rather than just the redirect.
    await test.step('checkout still detours to the quote form — already filled in', async () => {
      await page.locator('main a[href="/checkout"]').first().click()
      await expect(page).toHaveURL(/\/get-exact-delivery-quote/)
      await expectNoErrorScreen(page)
      // The same form as the modal's, so it opens with what was sent there.
      await expect(page.locator('#firstName')).toHaveValue(LEAD.first)
      await expect(page.locator('#lastName')).toHaveValue(LEAD.last)
      await expect(page.locator('#email')).toHaveValue(LEAD.email)
      await expect(page.locator('#zip')).toHaveValue(ZIP)
      await expect(page.locator('#city')).toHaveValue('Atlanta')
    })

    await test.step('checkout is filled in from the details they gave', async () => {
      // No expectNoErrorScreen here: a populated checkout renders no <h1> — the
      // only ones on that route belong to its confirmation, empty-cart and
      // error states — so the guard waits for an element that will not arrive.
      // The value assertions below prove the page rendered anyway.
      await page.goto('/checkout')
      await expect(page.getByPlaceholder('First Name').first()).toHaveValue(LEAD.first)
      await expect(page.getByPlaceholder('Email Address').first()).toHaveValue(LEAD.email)
      await expectPricesFormatted(page)
    })

    await test.step('the order can be placed — and is not', async () => {
      await expect(page.getByRole('button', { name: 'Place Order' })).toBeVisible()
    })
  })

  test('"Save your cart?" asks a guest with a cart once, then leaves them alone', async ({ page }) => {
    await test.step('put a container in the cart', async () => {
      await openListingFromHome(page)
      await openFirstContainer(page)
      await setZipOnProductPage(page, ZIP)
      await addToCartAndOpenCart(page)
    })

    const prompt = page.getByRole('dialog', { name: 'Save your cart?' })

    // An exit-intent prompt: it arms 15s after the cart gains items, then opens
    // only when the visitor heads for the tab bar (the cursor leaves through the
    // top of the window) or switches away. It never opens on its own.
    const leaveThroughTop = () =>
      page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0 })))

    await test.step('it waits while they are still browsing', async () => {
      await page.goto('/')
      await leaveThroughTop() // too soon — not armed yet
      await expect(prompt).toBeHidden()
    })

    await test.step('once armed, heading for the tab bar opens it', async () => {
      await page.waitForTimeout(16_000)
      await leaveThroughTop()
      await expect(prompt).toBeVisible()
    })

    await test.step('dismissed, it stays dismissed', async () => {
      await page.keyboard.press('Escape')
      await expect(prompt).toBeHidden()
      await page.reload()
      await page.waitForTimeout(16_000)
      await leaveThroughTop()
      await expect(prompt).toBeHidden()
    })
  })

  test('a container in the cart stops a ZIP change to another depot', async ({ page }) => {
    await autoDismissSaveCart(page)
    let productUrl = ''

    await test.step('container from Atlanta in the cart', async () => {
      await openListingFromHome(page)
      await openFirstContainer(page)
      await setZipOnProductPage(page, ZIP)
      productUrl = page.url()
      await addToCartAndOpenCart(page)
    })

    await test.step('back on the product, try Chicago', async () => {
      await page.goto(productUrl)
      await expectNoErrorScreen(page)
      const field = page.locator('#delivery-zip')
      // The box fills itself with the saved place ("Atlanta, GA 30303") a
      // moment after load. Cleared before that lands, the prefill comes back
      // and the ZIP is typed onto the end of it ("…3030360601").
      await expect(field).toHaveValue(new RegExp(ZIP))
      await field.fill('')
      await field.pressSequentially(OTHER_DEPOT_ZIP, { delay: 60 })
    })

    await test.step('refused: the prompt explains, nothing moves', async () => {
      await expect(page.getByRole('dialog', { name: 'Whoops! There seems to be a problem.' })).toBeVisible()
      expect(await page.evaluate(() => localStorage.getItem('zipcode'))).toBe(ZIP)
    })

    await test.step('Go to Cart takes them to the cart', async () => {
      await page.getByRole('link', { name: /Go to Cart/ }).click()
      await expect(page).toHaveURL(/\/cart/)
      await expectNoErrorScreen(page)
    })
  })

  test('an accessory goes from the listing into the cart', async ({ page }) => {
    await autoDismissSaveCart(page)

    await test.step('accessories listing → an accessory', async () => {
      await page.goto('/sale-shipping-containers?ptype=accessories')
      await expectNoErrorScreen(page)
      await page.locator('li.ais-Hits-item h2').first().click()
      await expect(page).toHaveURL(/\/product\//)
      await expectNoErrorScreen(page)
    })

    await test.step('add to cart', () => addToCartAndOpenCart(page))

    await test.step('cart shows it, priced properly', async () => {
      await expect(page.locator('main').getByRole('button', { name: 'Remove' })).toHaveCount(1)
      await expectPricesFormatted(page)
    })
  })
})
