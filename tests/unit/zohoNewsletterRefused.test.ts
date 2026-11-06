// How a Zoho newsletter answer is read (services/zohoNewsletter.service.ts).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { zohoNewsletterRefused } from '@/services/zohoNewsletter.service'

describe('zohoNewsletterRefused', () => {
  it('takes a page without an error as accepted, whatever its wording', () => {
    assert.equal(zohoNewsletterRefused(200, '', 'Thank you for subscribing to our newsletter.'), false)
    assert.equal(zohoNewsletterRefused(200, '', ''), false)
  })

  it('refuses a page that says the captcha or the submission was not valid', () => {
    assert.equal(zohoNewsletterRefused(200, '', 'Captcha validation failed. Please try again.'), true)
    assert.equal(zohoNewsletterRefused(200, '', 'The submission is invalid.'), true)
  })

  it('refuses the redirects Zoho uses for a refusal: back to the Referer, or to zoho.com', () => {
    assert.equal(zohoNewsletterRefused(302, 'https://onsitestorage.com/', ''), true)
    assert.equal(zohoNewsletterRefused(302, 'https://www.zoho.com/crm/', ''), true)
  })

  it('takes a redirect anywhere else (a thank-you page) as accepted', () => {
    assert.equal(zohoNewsletterRefused(302, 'https://onsitestorage.com/thank-you-newsletter', ''), false)
    // Only zoho.com itself: a host that merely contains the letters is not it.
    assert.equal(zohoNewsletterRefused(302, 'https://xzohoxcom/', ''), false)
  })

  it('refuses any other status', () => {
    assert.equal(zohoNewsletterRefused(403, '', ''), true)
  })
})
