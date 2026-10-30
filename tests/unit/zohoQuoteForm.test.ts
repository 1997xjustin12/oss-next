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

const ACCEPTED = 'https://onsitestorage.com/saved-quotes?zoho=sent'

describe("Zoho's answer", () => {
  it('a redirect to the returnURL is accepted', () => {
    assert.equal(zohoAccepted(302, ACCEPTED, ACCEPTED), true)
    assert.equal(zohoAccepted(301, 'https://OnsiteStorage.com/saved-quotes/?zoho=sent', ACCEPTED), true)
  })

  it('anything else is a refusal', () => {
    // Observed 2026-10-30: wrong form keys redirect to the Referer, an empty post to zoho.com.
    assert.equal(zohoAccepted(302, 'https://onsitestorage.com/', ACCEPTED), false)
    assert.equal(zohoAccepted(302, 'https://www.zoho.com', ACCEPTED), false)
    assert.equal(zohoAccepted(302, null, ACCEPTED), false)
    assert.equal(zohoAccepted(200, ACCEPTED, ACCEPTED), false)
    assert.equal(zohoAccepted(500, ACCEPTED, ACCEPTED), false)
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
    const body = zohoQuoteBody({ ...FILLED, firstName: '  Jane  ', lastName: 'x'.repeat(100) }, ACCEPTED)
    assert.equal(body.get('First Name'), 'Jane')
    assert.equal(body.get('Last Name'), 'x'.repeat(80))
    assert.equal(body.get('CONTACTCF7'), '30303')
    assert.equal(body.get('returnURL'), ACCEPTED)
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
