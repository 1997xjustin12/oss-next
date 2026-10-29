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
 * Submitting the quote form in A records a lead in Admin → Quote Requests, so
 * that final step only runs with E2E_ALLOW_LEADS=1. B's modal posts to Zoho
 * CRM, which would create a real Contact: the test answers that request itself
 * (and checks what was sent), so B has no side effect and always runs to the
 * checkout page — which is never submitted: no test here presses Place Order.
 */

const ZIP = '30303' // Atlanta: a depot with real stock
const OTHER_DEPOT_ZIP = '60601' // Chicago
const LEAD = { first: 'E2E', last: 'Test Visitor', email: 'e2e-test@example.com', phone: '(555) 010-0199' }

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
      await expect(page.locator('#fullName')).toBeVisible()
    })

    if (process.env.E2E_ALLOW_LEADS !== '1') {
      test.info().annotations.push({
        type: 'stopped early',
        description: 'Quote form not submitted — that records a lead. Set E2E_ALLOW_LEADS=1 to run it.',
      })
      return
    }

    await test.step('submit the quote form (records a lead)', async () => {
      await page.locator('#fullName').fill(`${LEAD.first} ${LEAD.last} (automated test, ignore)`)
      await page.locator('#phone').fill(LEAD.phone)
      await page.locator('#email').fill(LEAD.email)
      // The address is separate fields, and city/state/ZIP arrive filled from
      // the ZIP already given — only the street is ever blank here.
      await page.locator('#address1').fill('123 Test Street')
      // Both required since the 2026-09-23 design, and re-checked in the action.
      await page.locator('input[name="confirmDelivery"]').check()
      await page.locator('input[name="agreeTerms"]').check()
      await page.getByRole('button', { name: /Proceed with checkout/i }).click()
      await expect(page).toHaveURL(/\/checkout/)
      await expectNoErrorScreen(page)
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
      // Answered here, never sent: a real post creates a Contact in Zoho CRM.
      const zohoPosts: string[] = []
      await page.route('https://crm.zoho.com/**', (route) => {
        zohoPosts.push(route.request().postData() ?? '')
        return route.fulfill({ status: 200, contentType: 'text/html', body: '<p>e2e stub</p>' })
      })

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
      // A different ZIP is a different place: City and State follow it.
      await modal.locator('#guest-zip').fill('90210')
      await expect(modal.locator('#guest-city')).toHaveValue('Beverly Hills')
      await expect(modal.locator('#guest-state')).toHaveValue('CA')
      await modal.locator('#guest-zip').fill(ZIP)
      await expect(modal.locator('#guest-city')).toHaveValue('Atlanta')
      await modal.getByRole('button', { name: 'Get Quote' }).click()
      // Both steps stay in the page — the details panel is only slid aside and
      // made inert, so typed details survive a step back. Moving on means that
      // panel has gone inert, not that its fields disappeared.
      await expect(modal.locator('[inert]').filter({ has: page.locator('#guest-first-name') })).toHaveCount(1)
      await expectPricesFormatted(page, modal)

      // Posted once, with Zoho's field names, while the page stayed put.
      await expect.poll(() => zohoPosts.length).toBe(1)
      const sent = new URLSearchParams(zohoPosts[0])
      expect(sent.get('First Name')).toBe(LEAD.first)
      expect(sent.get('Last Name')).toBe(LEAD.last)
      expect(sent.get('Email')).toBe(LEAD.email)
      expect(sent.get('CONTACTCF7')).toBe(ZIP)
      expect(sent.get('CONTACTCF3')).toBe('Atlanta')
      expect(sent.get('aG9uZXlwb3Q')).toBe('')
      expect(page.url()).toContain('/product/')

      // Kept in this browser for the next copy of the form.
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('oss-quote-form') ?? 'null'))
      expect(saved).toMatchObject({ firstName: LEAD.first, email: LEAD.email, zip: ZIP, city: 'Atlanta' })

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
      await expect(page.locator('#fullName')).toHaveValue(`${LEAD.first} ${LEAD.last}`)
      await expect(page.locator('#email')).toHaveValue(LEAD.email)
      await expect(page.locator('#addressZip')).toHaveValue(ZIP)
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
