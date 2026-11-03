import { test, expect, type Page } from '@playwright/test'

/**
 * A submitted quote form tells the Zoho chat who the visitor is
 * (lib/salesIqVisitor.ts). Zoho's widget and the form's destination are both
 * stubbed, so nothing here reaches Zoho or creates a lead.
 */

const NAME = { first: 'Justin', last: 'Test Ignore', email: 'justin.test.ignore@example.com' }

async function stubZoho(page: Page) {
  await page.addInitScript(() => {
    const seen: Record<string, string> = {}
    Object.assign(window, {
      __seen: seen,
      $zoho: {
        salesiq: {
          visitor: {
            name: (value: string) => { seen.name = value },
            email: (value: string) => { seen.email = value },
          },
        },
      },
    })
  })
  await page.route('**/salesiq.zohopublic.com/**', (route) => route.abort())
  await page.route('**/crm.zoho.com/crm/WebToContactForm', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html><p>stubbed thank-you</p>' }),
  )
}

const seen = (page: Page) => page.evaluate(() => (window as unknown as { __seen: Record<string, string> }).__seen)

test.describe('quote forms identify the visitor to the chat', () => {
  test('the homepage form', async ({ page }) => {
    await stubZoho(page)
    await page.goto('/')
    await page.waitForLoadState('load')
    const form = page.locator('form[action*="WebToContactForm"]').first()
    await form.scrollIntoViewIfNeeded()
    // Keeps the page here after the handler has run, so what it told Zoho can be read.
    await page.evaluate(() => {
      const f = document.querySelector('form[action*="WebToContactForm"]')
      f?.addEventListener('submit', (event) => {
        event.preventDefault()
      })
    })
    await form.locator('[name="First Name"]').fill(NAME.first)
    await form.locator('[name="Last Name"]').fill(NAME.last)
    await form.locator('[name="Email"]').fill(NAME.email)
    await form.evaluate((f: HTMLFormElement) => {
      for (const el of f.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[required]')) el.required = false
      f.requestSubmit()
    })
    await expect.poll(() => seen(page)).toEqual({ name: `${NAME.first} ${NAME.last}`, email: NAME.email })
  })

  test('without the widget, submitting still works', async ({ page }) => {
    await page.route('**/salesiq.zohopublic.com/**', (route) => route.abort())
    await page.route('**/crm.zoho.com/crm/WebToContactForm', (route) =>
      route.fulfill({ contentType: 'text/html', body: '<!doctype html><p>stubbed thank-you</p>' }),
    )
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto('/')
    await page.waitForLoadState('load')
    const form = page.locator('form[action*="WebToContactForm"]').first()
    await form.locator('[name="First Name"]').fill(NAME.first)
    await form.locator('[name="Last Name"]').fill(NAME.last)
    await form.evaluate((f: HTMLFormElement) => {
      for (const el of f.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[required]')) el.required = false
      f.requestSubmit()
    })
    await expect(page.getByText('stubbed thank-you')).toBeVisible()
    expect(errors).toEqual([])
  })
})
