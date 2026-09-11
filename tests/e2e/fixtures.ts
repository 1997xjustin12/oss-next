import { test as base, expect, type Page } from '@playwright/test'

/**
 * The guard every journey runs under, plus the steps journeys share.
 *
 * "No errors on the customer journey" is made concrete here. A test fails if,
 * at any point, the page throws, logs an error, gets a 4xx/5xx from this site,
 * or shows the "Something Went Wrong" / "Page Not Found" screen. That catches
 * the failures a click-through misses — the ones that only show in the console.
 */

// ── Side effects ─────────────────────────────────────────────────────────────
//
// A journey must not reach sales, charge a card or send email. These are
// answered with an empty success in the browser, so the page carries on as if
// they worked. Cart sync is deliberately NOT here: the registered journeys test
// that a cart survives login, which is that sync. See README for the list.
const BLOCKED_ROUTES = [
  '**/api/abandoned-carts/**', // abandoned-cart records and their emails
  '**/api/braintree_checkout**', // the charge — never reached, this is a backstop
  '**/api/orders/checkout**', // recording the order
  '**/api/subscribers/subscribe**', // newsletter sign-up
  '**/api/auth/register**', // creating accounts
]

// ── Known, already-reported defects ──────────────────────────────────────────
//
// Recorded on the test (so they stay visible in the report) instead of failing
// it, so the suite can catch *new* breakage. Every entry needs a reason; delete
// it once the defect is fixed and the suite will hold the line from then on.
const KNOWN_ISSUES: { pattern: RegExp; why: string }[] = [
  {
    // Prefetches only — a navigation that 404s is still a failure. The
    // response listener marks a request as a prefetch by its router header.
    pattern: /^HTTP 404 GET \(prefetch\) /,
    why: 'Router prefetches 404 after the depot swap rewrites the product URL in place: the router keeps the old page as its state, so its prefetches — product and listing links alike — fail. Verified harmless: clicking those links still lands correctly. Fix: make the swap update the router, not just the address bar.',
  },
  {
    pattern: /Cannot read properties of null \(reading 'parentNode'\)/,
    why: "React's streaming Suspense resolver ($RS) — intermittent on product pages, predates this suite, not yet traced",
  },
]

// Console noise that is not ours to fix and says nothing about the journey.
const IGNORED_CONSOLE: RegExp[] = [
  // Resource failures are judged by the response listener below, which knows
  // the URL; the console copy of the same event does not.
  /^Failed to load resource/,
]

export type Guard = {
  problems: string[]
  known: string[]
  blocked: string[]
}

export const test = base.extend<{ guard: Guard }>({
  guard: [
    async ({ page, baseURL }, use, testInfo) => {
      const origin = new URL(baseURL!).origin
      const guard: Guard = { problems: [], known: [], blocked: [] }

      const record = (message: string) => {
        const known = KNOWN_ISSUES.find((k) => k.pattern.test(message))
        if (known) guard.known.push(`${message.slice(0, 160)}  —  ${known.why}`)
        else guard.problems.push(message.slice(0, 400))
      }

      for (const pattern of BLOCKED_ROUTES) {
        await page.route(pattern, (route) => {
          guard.blocked.push(`${route.request().method()} ${route.request().url().replace(origin, '')}`)
          return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
        })
      }

      page.on('pageerror', (error) => record(`page error: ${error.message}`))

      page.on('console', (message) => {
        if (message.type() !== 'error') return
        const text = message.text()
        if (IGNORED_CONSOLE.some((pattern) => pattern.test(text))) return
        record(`console error: ${text}`)
      })

      page.on('response', (response) => {
        const url = response.url()
        if (!url.startsWith(origin) || response.status() < 400) return
        // Remote product photos proxied through the image optimiser: a broken
        // one is a catalogue data problem, not a broken journey.
        if (url.includes('/_next/image')) return
        // A router prefetch is a guess at where the visitor might go next; a
        // failed one costs speed, not a broken page. Marked so KNOWN_ISSUES can
        // tell it apart from a real navigation, which still fails the test.
        const prefetch = response.request().headers()['next-router-prefetch'] ? ' (prefetch)' : ''
        record(`HTTP ${response.status()} ${response.request().method()}${prefetch} ${url.replace(origin, '')}`)
      })

      await use(guard)

      if (guard.known.length) {
        testInfo.annotations.push({ type: 'known issue', description: [...new Set(guard.known)].join('\n') })
      }
      if (guard.blocked.length) {
        testInfo.annotations.push({ type: 'blocked side effects', description: [...new Set(guard.blocked)].join('\n') })
      }
      expect(guard.problems, 'errors during the journey').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

// ── Shared journey steps ─────────────────────────────────────────────────────

/** Fails if the page is showing either error screen. Call after every hop. */
export async function expectNoErrorScreen(page: Page) {
  const heading = page.locator('h1').first()
  await expect(heading).not.toHaveText(/Something Went Wrong|Page Not Found/i)
}

/**
 * "Save your cart?" arms 15s after the cart gains items, then opens on exit
 * intent — the cursor leaving through the top of the window, or the tab being
 * hidden. Journeys that are not about it get it closed whenever it would block
 * a click, the way a visitor who is not interested would close it.
 */
export async function autoDismissSaveCart(page: Page) {
  await page.addLocatorHandler(page.getByRole('dialog', { name: 'Save your cart?' }), async () => {
    await page.keyboard.press('Escape')
  })
}

/** Home → nav "Buy" → the listing. */
export async function openListingFromHome(page: Page) {
  await page.goto('/')
  await expectNoErrorScreen(page)
  // On a phone the nav links live behind the hamburger — open it first, the
  // way a visitor on a phone has to.
  const buy = page.locator('header a[href*="ptype=buy"]:visible, nav a[href*="ptype=buy"]:visible').first()
  if (!(await buy.isVisible().catch(() => false))) {
    await page.getByRole('button', { name: 'Open menu' }).click()
  }
  await page.locator('header a[href*="ptype=buy"]:visible, nav a[href*="ptype=buy"]:visible').first().click()
  await expect(page).toHaveURL(/\/sale-shipping-containers/)
  await expectNoErrorScreen(page)
}

/** Click the first container card on the listing through to its product page. */
export async function openFirstContainer(page: Page) {
  const card = page.locator('h3').filter({ hasText: /container/i }).first()
  await expect(card).toBeVisible()
  await card.click()
  await expect(page).toHaveURL(/\/product\//)
  await expectNoErrorScreen(page)
}

/**
 * Give the product page a ZIP, through whichever control it offers: the gate
 * dialog on a reference listing, or the delivery ZIP field on a real one.
 * Resolves once the ZIP has been saved.
 */
export async function setZipOnProductPage(page: Page, zip: string) {
  const startPath = new URL(page.url()).pathname
  const gate = page.getByRole('dialog').filter({ has: page.locator('#zip-gate-title') })
  // The gate opens a beat after load, once the page has checked for a stored
  // ZIP. Looking for it immediately misses it, types into the delivery field
  // instead, and never waits for the swap — so give it a moment to appear.
  const viaGate = await gate
    .waitFor({ state: 'visible', timeout: 8_000 })
    .then(() => true)
    .catch(() => false)
  if (viaGate) {
    await gate.locator('input').first().pressSequentially(zip, { delay: 60 })
  } else {
    const field = page.locator('#delivery-zip')
    await field.fill('')
    await field.pressSequentially(zip, { delay: 60 })
  }
  await expect.poll(() => page.evaluate(() => localStorage.getItem('zipcode'))).toBe(zip)

  // The gate belongs to a reference listing, which has no depot and cannot be
  // added to the cart. Saving the ZIP swaps the page onto that depot's real
  // container a moment later — wait for it, or "Add to cart" lands on the
  // listing and just reopens the gate.
  if (viaGate) {
    await expect
      .poll(() => new URL(page.url()).pathname, { message: 'page swapped to the depot container', timeout: 30_000 })
      .not.toBe(startPath)
  }
  await expectNoErrorScreen(page)
}

/** Add the product on screen to the cart and go to the cart through the confirmation. */
export async function addToCartAndOpenCart(page: Page) {
  const add = page.getByRole('button', { name: /^Add to cart$/i }).first()
  await expect(add).toBeEnabled()
  await add.click()
  const added = page.getByRole('dialog', { name: 'Added to Cart!' })
  await expect(added).toBeVisible()
  await added.locator('a[href="/cart"]').first().click()
  await expect(page).toHaveURL(/\/cart/)
  await expectNoErrorScreen(page)
}

/** Every price on screen reads `$1,300.00` — the format agreed for the whole site. */
export async function expectPricesFormatted(page: Page, scope = page.locator('main')) {
  const text = (await scope.innerText()).replace(/\s+/g, ' ')
  const prices = text.match(/\$[\d,]+(?:\.\d+)?/g) ?? []
  const wrong = prices.filter((p) => !/^\$\d{1,3}(,\d{3})*\.\d{2}$/.test(p))
  expect(wrong, 'prices not in $1,300.00 format').toEqual([])
  return prices
}

/** Log in through the storefront form with the account from .env.local. */
export async function login(page: Page) {
  const username = process.env.E2E_USER
  const password = process.env.E2E_PASSWORD
  if (!username || !password) throw new Error('Set E2E_USER and E2E_PASSWORD in .env.local')

  await page.goto('/my-account')
  await page.locator('#login-email').fill(username)
  await page.locator('#login-password').fill(password)
  await page.locator('form').filter({ has: page.locator('#login-email') }).locator('button[type="submit"]').click()
  await expect(page.getByText('Hello', { exact: false }).first()).toBeVisible()
  await expectNoErrorScreen(page)

  await waitForCartToSettle(page)
}

/**
 * Wait until a signed-in page has finished reloading the saved cart.
 *
 * Every page load for a signed-in customer re-fetches their saved cart and
 * rebuilds each line from the catalogue, then replaces the local cart with it
 * ("server cart wins"). Anything done to the cart before that lands is
 * overwritten when it does — a Remove clicked too early simply comes back.
 */
export async function waitForCartToSettle(page: Page) {
  await page.waitForLoadState('networkidle')
  let previous = ''
  await expect
    .poll(async () => {
      const now = await page.evaluate(() => localStorage.getItem('oss-cart') ?? '')
      const settled = now === previous
      previous = now
      return settled
    }, { intervals: [1_500], timeout: 20_000, message: 'saved cart settled' })
    .toBe(true)
}
