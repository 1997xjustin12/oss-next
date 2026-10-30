// The Zoho quote form's shared rules (lib/zohoQuoteForm.ts): what is required,
// what is sent to Zoho, and how Zoho's answer is read.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  EMPTY_ZOHO_QUOTE,
  initialZohoQuote,
  pickZohoQuote,
  validateZohoQuote,
  zohoAccepted,
  zohoQuoteBody,
  zohoQuoteToLead,
} from '@/lib/zohoQuoteForm'

const FILLED = {
  ...EMPTY_ZOHO_QUOTE,
  firstName: 'Jane',
  lastName: 'Alvarez',
  phone: '(555) 123-4567',
  email: 'jane@example.com',
  zip: '30303',
}

// Zoho's thank-you page for this form, as its words, from a real submission on 2026-10-30.
const THANK_YOU =
  'Thank you for submitting your response. Your response has been submitted successfully. We will reach out to you soon.'

describe("Zoho's answer", () => {
  it("its thank-you page is an acceptance", () => {
    assert.equal(zohoAccepted(200, THANK_YOU), true)
  })

  it('anything else is a refusal', () => {
    // Observed 2026-10-30: wrong form keys and an empty post are both 302s.
    assert.equal(zohoAccepted(302, ''), false)
    // A 200 that says something else (an error page) is not an acceptance.
    assert.equal(zohoAccepted(200, 'Please enter a valid value for Last Name'), false)
    assert.equal(zohoAccepted(200, ''), false)
    assert.equal(zohoAccepted(500, THANK_YOU), false)
  })
})

describe('the form', () => {
  it('requires the five fields Zoho requires, in its order', () => {
    assert.equal(validateZohoQuote(FILLED), null)
    assert.match(validateZohoQuote({ ...FILLED, firstName: ' ' }) ?? '', /first name/)
    assert.match(validateZohoQuote({ ...FILLED, lastName: '' }) ?? '', /last name/)
    assert.match(validateZohoQuote({ ...FILLED, phone: '' }) ?? '', /phone/)
    assert.match(validateZohoQuote({ ...FILLED, email: 'jane@' }) ?? '', /email/)
    assert.match(validateZohoQuote({ ...FILLED, zip: '' }) ?? '', /ZIP/)
    // Street, city and state are optional, as in Zoho.
    assert.equal(validateZohoQuote({ ...FILLED, street: '', city: '', state: '' }), null)
  })

  it("posts each field under Zoho's name, trimmed and cut to Zoho's length, with the hidden values", () => {
    const body = zohoQuoteBody({ ...FILLED, firstName: '  Jane  ', lastName: 'x'.repeat(100) })
    assert.equal(body.get('First Name'), 'Jane')
    assert.equal(body.get('Last Name'), 'x'.repeat(80))
    assert.equal(body.get('CONTACTCF7'), '30303')
    assert.equal(body.get('returnURL'), 'null')
    assert.equal(body.get('actionType'), 'Q29udGFjdHM=')
    assert.equal(body.get('aG9uZXlwb3Q'), '')
  })

  it('keeps only our fields from a request body', () => {
    const picked = pickZohoQuote({ ...FILLED, admin: true, email: 42, extra: 'x' })
    assert.deepEqual(Object.keys(picked).sort(), Object.keys(EMPTY_ZOHO_QUOTE).sort())
    assert.equal(picked.email, '')
    assert.equal(pickZohoQuote(null).firstName, '')
  })

  it('becomes the site-wide guest lead checkout reads', () => {
    const lead = zohoQuoteToLead({ ...FILLED, street: '1 Peachtree St', city: 'Atlanta', state: 'GA' })
    assert.equal(lead.fullName, 'Jane Alvarez')
    assert.equal(lead.address, '1 Peachtree St, Atlanta, GA 30303')
    assert.equal(lead.zip, '30303')
  })

  it('opens from an older guest lead when nothing was submitted here', () => {
    const values = initialZohoQuote(
      { fullName: 'Jane van Alvarez', email: 'jane@example.com', phone: '1', address: '', zip: '30303', capturedAt: '' },
      '90210',
    )
    assert.equal(values.firstName, 'Jane')
    assert.equal(values.lastName, 'van Alvarez')
    assert.equal(values.zip, '30303')
    assert.equal(initialZohoQuote(null, '90210').zip, '90210')
  })
})
