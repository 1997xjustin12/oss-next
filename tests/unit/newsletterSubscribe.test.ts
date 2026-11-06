// POST /api/subscribers/subscribe: where one newsletter signup goes, and when it
// counts as done. Zoho and the Django backend are stubbed; nothing leaves the test.
import { beforeEach, describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'

let zohoOutcome: 'accepted' | 'refused' | 'unavailable' = 'accepted'
let backendFails = false
let recaptchaOk = true
const calls: string[] = []

mock.module('@/lib/agentApi', { namedExports: { checkRateLimit: async () => ({ allowed: true }) } })
mock.module('@/lib/clientIp', { namedExports: { clientIp: async () => '203.0.113.9' } })
mock.module('@/lib/recaptcha', {
  namedExports: { isRecaptchaConfigured: () => true, verifyRecaptcha: async () => recaptchaOk },
})
mock.module('@/services/zohoNewsletter.service', {
  namedExports: {
    sendZohoNewsletter: async (signup: { name: string; email: string; captchaToken: string }) => {
      calls.push(`zoho:${signup.name}:${signup.email}:${signup.captchaToken}`)
      return zohoOutcome
    },
  },
})
mock.module('@/services/subscriber.service', {
  namedExports: {
    subscribeToNewsletter: async (email: string) => {
      calls.push(`backend:${email}`)
      if (backendFails) throw new Error('Backend said no.')
    },
  },
})

const { POST } = await import('@/app/api/subscribers/subscribe/route')

async function post(body: Record<string, unknown>) {
  const res = await POST(new Request('https://site.test/api/subscribers/subscribe', { method: 'POST', body: JSON.stringify(body) }) as never)
  return { status: res.status, body: (await res.json()) as { ok?: boolean; error?: string } }
}

const signup = { email: 'ann@example.com', name: 'Ann Lee', zohoCaptchaToken: 'tok' }

beforeEach(() => {
  zohoOutcome = 'accepted'
  backendFails = false
  recaptchaOk = true
  calls.length = 0
})

describe('newsletter signup with the Zoho captcha (NewsletterForm)', () => {
  it('goes to Zoho, then to the backend', async () => {
    const res = await post(signup)
    assert.equal(res.status, 200)
    assert.deepEqual(calls, ['zoho:Ann Lee:ann@example.com:tok', 'backend:ann@example.com'])
  })

  it('stops when Zoho refuses it, and the backend never sees it', async () => {
    zohoOutcome = 'refused'
    const res = await post(signup)
    assert.equal(res.status, 400)
    assert.match(res.body.error ?? '', /robot/)
    assert.deepEqual(calls, ['zoho:Ann Lee:ann@example.com:tok'])
  })

  it('still succeeds when the backend fails but Zoho took it', async () => {
    backendFails = true
    assert.equal((await post(signup)).status, 200)
  })

  it('still succeeds when Zoho does not answer but the backend took it', async () => {
    zohoOutcome = 'unavailable'
    assert.equal((await post(signup)).status, 200)
  })

  it('fails when neither took it', async () => {
    zohoOutcome = 'unavailable'
    backendFails = true
    assert.equal((await post(signup)).status, 400)
  })

  it('needs the name, which Zoho requires', async () => {
    const res = await post({ ...signup, name: '  ' })
    assert.equal(res.status, 400)
    assert.deepEqual(calls, [])
  })
})

describe('newsletter signup without it (the account page)', () => {
  it('goes to the backend only, behind the app’s own reCAPTCHA', async () => {
    assert.equal((await post({ email: 'ann@example.com', recaptchaToken: 'v3' })).status, 200)
    assert.deepEqual(calls, ['backend:ann@example.com'])
  })

  it('is refused when that check fails', async () => {
    recaptchaOk = false
    assert.equal((await post({ email: 'ann@example.com' })).status, 400)
    assert.deepEqual(calls, [])
  })

  it('refuses an invalid email before sending anything', async () => {
    assert.equal((await post({ ...signup, email: 'not-an-email' })).status, 400)
    assert.deepEqual(calls, [])
  })
})
