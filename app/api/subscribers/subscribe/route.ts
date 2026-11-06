import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/agentApi'
import { rateLimitedReply } from '@/lib/backendError'
import { clientIp } from '@/lib/clientIp'
import { isRecaptchaConfigured, verifyRecaptcha } from '@/lib/recaptcha'
import { subscribeToNewsletter } from '@/services/subscriber.service'
import { sendZohoNewsletter } from '@/services/zohoNewsletter.service'

/** Loose on purpose: the backend is the authority; this only stops obvious junk. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const FAILED = 'Could not subscribe. Please try again.'

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/** The Django backend's subscribe, as an outcome rather than a throw. */
async function subscribeBackend(email: string): Promise<{ ok: true } | { ok: false; error: string; reply?: Response }> {
  try {
    await subscribeToNewsletter(email)
    return { ok: true }
  } catch (err) {
    // The backend's 429 travels as itself, with its message and Retry-After.
    const reply = rateLimitedReply(err) ?? undefined
    console.error('[/api/subscribers/subscribe] backend', err)
    return { ok: false, error: err instanceof Error ? err.message : FAILED, reply }
  }
}

/**
 * One newsletter signup, to every list it belongs on (lib/newsletter.ts calls this).
 *
 * POST { email, name?, zohoCaptchaToken?, recaptchaToken? }
 *
 * - With `zohoCaptchaToken` (the newsletter form's "I'm not a robot" box): the
 *   signup goes to Zoho CRM first, which checks that token. Zoho refusing it
 *   stops there. Zoho accepting it, or not answering, sends it on to the Django
 *   backend. Success when either took it; the other is logged.
 * - Without it (the account page's toggle): Django only, behind the app's own
 *   reCAPTCHA v3 check once a key is configured.
 */
export async function POST(request: NextRequest) {
  const limit = await checkRateLimit(request, 'newsletter')
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute and try again.' }, { status: 429 })
  }

  const input = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>
  const email = text(input.email, 254)
  const name = text(input.name, 80)
  const zohoCaptchaToken = text(input.zohoCaptchaToken, 4000)

  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  if (!EMAIL.test(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })

  if (!zohoCaptchaToken) {
    if (isRecaptchaConfigured() && !(await verifyRecaptcha(text(input.recaptchaToken, 4000), 'newsletter'))) {
      return NextResponse.json({ error: 'We could not verify this request. Please try again.' }, { status: 400 })
    }
    const backend = await subscribeBackend(email)
    if (backend.ok) return NextResponse.json({ ok: true })
    return backend.reply ?? NextResponse.json({ error: backend.error }, { status: 400 })
  }

  if (!name) return NextResponse.json({ error: 'Enter your full name.' }, { status: 400 })

  const zoho = await sendZohoNewsletter({
    name,
    email,
    captchaToken: zohoCaptchaToken,
    userAgent: request.headers.get('user-agent'),
    ip: await clientIp(request),
  })
  if (zoho.outcome === 'refused') {
    // Zoho's answer goes back too, under its own key: the visitor sees only the
    // sentence, and the Network tab shows what Zoho said.
    const { status, location, excerpt } = zoho
    return NextResponse.json(
      { error: 'We could not verify that you’re not a robot. Please tick the box again.', zoho: { status, location, excerpt } },
      { status: 400 },
    )
  }

  const backend = await subscribeBackend(email)
  if (zoho.outcome === 'accepted' || backend.ok) return NextResponse.json({ ok: true })
  return backend.reply ?? NextResponse.json({ error: FAILED }, { status: 400 })
}
