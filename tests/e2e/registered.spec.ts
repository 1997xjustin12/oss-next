import type { Page } from '@playwright/test'
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
  login,
  waitForCartToSettle,
} from './fixtures'

/**
 * A customer with an account, using the login in .env.local (E2E_USER /
 * E2E_PASSWORD). Skipped when those are not set.
 *
 * This is a real account on the real backend, and a signed-in cart is saved
 * there. So every test records the account's cart — each line and its
 * quantity — right after logging in, and puts it back exactly that way
 * afterwards. Removing only "new" lines was not enough: once one run leaked a
 * container, the next run's add just raised its quantity, nothing looked new,
 * and the leak grew. Quantities are restored as well as lines for that reason.
 */

const ZIP = '30303' // Atlanta

type CartLine = { id: string; name: string; quantity?: number; isContainer?: boolean; location?: string }

function cartLines(page: Page): Promise<CartLine[]> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('oss-cart') || '{"items":[]}').items ?? [])
}

/** Lines that are new since `before`, or whose quantity went up — what this test added. */
async function linesAddedSince(page: Page, before: CartLine[]): Promise<CartLine[]> {
  const had = new Map(before.map((line) => [line.id, line.quantity ?? 1]))
  return (await cartLines(page)).filter((line) => (line.quantity ?? 1) > (had.get(line.id) ?? 0))
}

/**
 * Put the account's cart back exactly as `before`: remove lines it did not
 * have, and bring raised quantities back down — through the cart page, the way
 * a customer would, so the change syncs to the backend like any other.
 */
async function restoreCart(page: Page, before: CartLine[]) {
  const want = new Map(before.map((line) => [line.id, line.quantity ?? 1]))
  const extra = await linesAddedSince(page, before)
  if (!extra.length) return

  await page.goto('/cart')
  // The cart page re-fetches the saved cart on load and lets it win. Removing a
  // line before that lands just has it put back — which is how the phone-size
  // run leaked a container into the account.
  await waitForCartToSettle(page)
  for (const line of extra) {
    const row = page
      .locator('main div.rounded-xl')
      .filter({ hasText: line.name })
      .filter({ has: page.getByRole('button', { name: 'Remove' }) })
      .last()
    if (!(await row.count())) continue
    const keep = want.get(line.id) ?? 0
    if (keep === 0) {
      await row.getByRole('button', { name: 'Remove' }).click()
    } else {
      for (let qty = line.quantity ?? 1; qty > keep; qty--) {
        await row.getByRole('button', { name: 'Decrease quantity' }).click()
      }
    }
  }

  // Confirm locally, then give the 800ms-debounced sync room to reach the backend.
  await expect.poll(async () => (await linesAddedSince(page, before)).length, { message: 'cart restored' }).toBe(0)
  await page.waitForTimeout(3_000)
}

/**
 * A container already in the account's cart from another depot would turn
 * "add to cart" into the location-conflict prompt. That is the app working, not
 * the journey failing — so say so plainly rather than fail confusingly.
 */
async function skipIfCartHoldsAnotherDepot(page: Page) {
  const other = (await cartLines(page)).find((line) => line.isContainer && line.location && !/Atlanta/.test(line.location))
  test.skip(!!other, `The test account's cart already holds a container from ${other?.location}. Empty it to run this journey.`)
}

test.describe('registered customer', () => {
  test.skip(!process.env.E2E_USER || !process.env.E2E_PASSWORD, 'Set E2E_USER and E2E_PASSWORD in .env.local')

  // The account's cart as it was when the test logged in; restored afterwards.
  let snapshot: CartLine[] | null = null
  test.beforeEach(() => {
    snapshot = null
  })
  test.afterEach(async ({ page }) => {
    if (snapshot) await restoreCart(page, snapshot)
  })

  test('logs in, adds a container and reaches checkout @mobile', async ({ page }) => {
    await autoDismissSaveCart(page)

    await test.step('log in', () => login(page))
    await skipIfCartHoldsAnotherDepot(page)
    const before = await cartLines(page)
    snapshot = before

    await test.step('listing → product → ZIP → add to cart', async () => {
      await openListingFromHome(page)
      await openFirstContainer(page)
      await setZipOnProductPage(page, ZIP)
      await addToCartAndOpenCart(page)
      const added = await linesAddedSince(page, before)
      expect(added, 'the container this test added — a new line, or one more of an existing one').toHaveLength(1)
      await expectPricesFormatted(page)
    })

    await test.step('checkout goes straight to checkout — no quote-form detour', async () => {
      await page.locator('main a[href="/checkout"]').first().click()
      await expect(page).toHaveURL(/\/checkout$/)
      await expectNoErrorScreen(page)
      await expectPricesFormatted(page)
      await expect(page.getByRole('button', { name: 'Place Order' })).toBeVisible()
    })

    await test.step('record whether checkout used their account details', async () => {
      const email = await page.getByPlaceholder('Email Address').first().inputValue()
      test.info().annotations.push({
        type: 'finding',
        description: email
          ? 'Checkout pre-filled the email from the account.'
          : 'Checkout did not pre-fill anything from the signed-in account — only guest details are used. Reported, not failed.',
      })
    })
  })

  test('a cart built as a guest survives logging in', async ({ page }) => {
    // Expected to fail, deliberately. At login the account's saved cart
    // REPLACES whatever the visitor added as a guest ("Server cart wins" in
    // CartContext, carried over from the reference app), so the container they
    // just chose disappears the moment they sign in to check out. That is a
    // product decision, not a defect this suite should hide or quietly paper
    // over. Once guest lines are merged at login this starts passing, the
    // runner reports an unexpected pass, and this line should be deleted.
    test.fail(true, 'Saved server cart replaces the guest cart at login — awaiting a product decision')
    await autoDismissSaveCart(page)
    let guestLine: CartLine | undefined

    await test.step('as a guest, put a container in the cart', async () => {
      await openListingFromHome(page)
      await openFirstContainer(page)
      await setZipOnProductPage(page, ZIP)
      await addToCartAndOpenCart(page)
      ;[guestLine] = await cartLines(page)
      expect(guestLine, 'the guest cart line').toBeTruthy()
    })

    await test.step('log in', () => login(page))
    // What the account held, without the guest line — so if login ever starts
    // merging the guest cart in, the clean-up takes that line back out.
    snapshot = (await cartLines(page)).filter((line) => line.id !== guestLine!.id)

    await test.step('the guest line is still in the cart', async () => {
      await page.goto('/cart')
      await expectNoErrorScreen(page)
      await expect(page.locator('main').getByText(guestLine!.name).first()).toBeVisible()
    })
  })

  test('Buy Again from order history re-adds a container as a container', async ({ page }) => {
    await test.step('log in', () => login(page))
    const before = await cartLines(page)
    snapshot = before

    await page.goto('/my-account/orders')
    await expectNoErrorScreen(page)

    const buyAgain = page.getByRole('button', { name: /Buy Again/ }).first()
    const hasOrders = await buyAgain.isVisible({ timeout: 20_000 }).catch(() => false)
    test.skip(!hasOrders, 'The test account has no past orders with a Buy Again button.')

    await test.step('Buy Again', async () => {
      await buyAgain.click()
      await expect.poll(async () => (await linesAddedSince(page, before)).length).toBeGreaterThan(0)
    })

    await test.step('a container comes back marked as one, with its depot', async () => {
      const [line] = await linesAddedSince(page, before)
      const raw = await page.evaluate(
        (id) => (JSON.parse(localStorage.getItem('oss-cart') || '{"items":[]}').items ?? []).find((i: { id: string }) => i.id === id),
        line.id,
      )
      const categories: string[] = (raw?.rawHit?.product_category ?? []).map((c: { category_name: string }) => c.category_name)
      const isContainerProduct = categories.some((name) => ['Shipping Containers', 'Generic Product Page'].includes(name))
      if (isContainerProduct) {
        expect(raw.isContainer, 'Buy Again container marked isContainer').toBe(true)
        expect(raw.location, 'Buy Again container carries its depot').toBeTruthy()
      } else {
        test.info().annotations.push({ type: 'note', description: 'The first past order line is an accessory — nothing to check.' })
      }
    })
  })
})
