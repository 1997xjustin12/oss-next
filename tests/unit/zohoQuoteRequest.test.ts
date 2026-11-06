// The FAQ page's quote request: its checks and the body Zoho gets (lib/zohoQuoteRequest.ts),
// and what the route does with each Zoho answer (app/api/zoho-quote-request). Zoho is stubbed.
import { beforeEach, describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

let zohoOutcome: 'accepted' | 'refused' | 'unavailable' = 'accepted'
let posted: URLSearchParams | null = null

mock.module('@/lib/agentApi', { namedExports: { checkRateLimit: async () => ({ allowed: true }) } })
mock.module('@/lib/clientIp', { namedExports: { clientIp: async () => '203.0.113.9' } })
mock.module('@/services/zohoWebForm.service', {
  namedExports: {
    postZohoWebForm: async ({ body }: { body: URLSearchParams }) => {
      posted = body
      return { outcome: zohoOutcome, status: zohoOutcome === 'refused' ? 302 : 200, location: '', excerpt: '' }
    },
  },
})

const { EMPTY_QUOTE_REQUEST, validateQuoteRequest, zohoQuoteRequestBody } = await import('@/lib/zohoQuoteRequest')
const { POST } = await import('@/app/api/zoho-quote-request/route')

const valid = {
  ...EMPTY_QUOTE_REQUEST,
  firstName: 'Ann',
  lastName: 'Lee',
  email: 'ann@example.com',
  phone: '555 0100',
  zip: '30303',
  size: '20ft Container',
  condition: 'Used',
  timing: 'Within two weeks',
}

async function post(body: Record<string, unknown>) {
  const res = await POST(new Request('https://site.test/api/zoho-quote-request', { method: 'POST', body: JSON.stringify(body) }))
  return { status: res.status, body: (await res.json()) as { ok: boolean; error?: string; errors?: Record<string, string> } }
}

beforeEach(() => {
  zohoOutcome = 'accepted'
  posted = null
})

describe('validateQuoteRequest', () => {
  it('passes a complete request', () => {
    assert.deepEqual(validateQuoteRequest(valid, true), {})
  })

  it('names every missing required field, the privacy box included', () => {
    const errors = validateQuoteRequest(EMPTY_QUOTE_REQUEST, false)
    assert.deepEqual(Object.keys(errors).sort(), ['condition', 'email', 'firstName', 'lastName', 'phone', 'privacy', 'size', 'timing', 'zip'])
  })

  it('refuses an option the form does not offer, and a bad email', () => {
    const errors = validateQuoteRequest({ ...valid, size: 'A spaceship', email: 'nope' }, true)
    assert.ok(errors.size && errors.email)
  })
})

describe('zohoQuoteRequestBody', () => {
  it('sends WordPress’s field names, hidden values and the captcha', () => {
    const body = zohoQuoteRequestBody(valid, 'tok')
    assert.equal(body.get('First Name'), 'Ann')
    assert.equal(body.get('CONTACTCF7'), '30303')
    assert.equal(body.get('CONTACTCF23'), '20ft Container')
    assert.equal(body.get('xmIwtLD'), '2aadffe0b3639daae20e5c883d7659c2f4c5e4089941fb9c835cfd326f9e66e3')
    assert.equal(body.get('returnURL'), 'null')
    assert.equal(body.get('g-recaptcha-response'), 'tok')
  })
})

describe('POST /api/zoho-quote-request', () => {
  it('sends a valid request and reports Zoho taking it', async () => {
    const res = await post({ ...valid, privacy: true, captchaToken: 'tok' })
    assert.equal(res.status, 200)
    assert.equal(res.body.ok, true)
    assert.equal(posted?.get('Email'), 'ann@example.com')
  })

  it('refuses an invalid request with every field error, and sends nothing', async () => {
    const res = await post({ privacy: false, captchaToken: 'tok' })
    assert.equal(res.status, 400)
    assert.ok(res.body.errors?.zip && res.body.errors?.privacy)
    assert.equal(posted, null)
  })

  it('needs the captcha', async () => {
    assert.equal((await post({ ...valid, privacy: true })).status, 400)
    assert.equal(posted, null)
  })

  it('reports a Zoho refusal as the captcha, and an outage without a 5xx', async () => {
    zohoOutcome = 'refused'
    assert.equal((await post({ ...valid, privacy: true, captchaToken: 'tok' })).status, 400)
    zohoOutcome = 'unavailable'
    const res = await post({ ...valid, privacy: true, captchaToken: 'tok' })
    assert.equal(res.status, 200)
    assert.equal(res.body.ok, false)
  })

  it('answers a bot that filled the honeypot as if sent, and sends nothing', async () => {
    const res = await post({ ...valid, privacy: true, captchaToken: 'tok', website: 'spam.example' })
    assert.equal(res.body.ok, true)
    assert.equal(posted, null)
  })
})
