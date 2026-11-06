import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/agentApi'
import { clientIp } from '@/lib/clientIp'
import { CONTACT_NUMBER } from '@/lib/helpers'
import { QUOTE_REQUEST_HONEYPOT, ZOHO_QUOTE_REQUEST, pickQuoteRequest, validateQuoteRequest, zohoQuoteRequestBody, type QuoteRequestErrors } from '@/lib/zohoQuoteRequest'
import { postZohoWebForm } from '@/services/zohoWebForm.service'

/** Room for Zoho to answer: it takes under a second, but a slow day should not cost the lead. */
export const maxDuration = 30

type Result = { ok: true } | { ok: false; error: string; errors?: QuoteRequestErrors; zoho?: { status: number | null; location: string; excerpt: string } }

const SEND_FAILED = `We couldn't send your request just now. Please try again, or call us at ${CONTACT_NUMBER}.`

function answer(result: Result, status = 200) {
  return NextResponse.json(result, { status, headers: { 'Cache-Control': 'no-store' } })
}

/**
 * Sends the FAQ page's quote request (lib/zohoQuoteRequest.ts) to its Zoho CRM
 * form, server to server, and says whether Zoho took it.
 *
 * POST { firstName, lastName, email, phone, street, city, state, zip, size, condition, timing, notes, privacy, captchaToken }
 *   200 { ok: true }
 *   400 { ok: false, error, errors }   a field is missing or invalid (the form checks first)
 *   400 { ok: false, error, zoho }     Zoho refused it (most likely the captcha); Zoho's answer under `zoho`
 *   429 { ok: false, error }           more than 5 a minute from one visitor (`quote` bucket)
 *   200 { ok: false, error }           Zoho did not answer
 *
 * Never a 5xx: Cloudflare, in front of the site, replaces one with its own page,
 * and the form could no longer read the reason (see app/api/zoho-quote).
 */
export async function POST(request: Request) {
  const limit = await checkRateLimit(request, 'quote')
  if (!limit.allowed) return answer({ ok: false, error: 'Too many requests. Please wait a minute and try again.' }, 429)

  const input = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>

  // A bot filled the field no person sees: answer as if sent, send nothing.
  if (typeof input[QUOTE_REQUEST_HONEYPOT] === 'string' && input[QUOTE_REQUEST_HONEYPOT]) return answer({ ok: true })

  const values = pickQuoteRequest(input)
  const errors = validateQuoteRequest(values, input.privacy === true)
  if (Object.keys(errors).length > 0) return answer({ ok: false, error: 'Please check the highlighted fields.', errors }, 400)

  const captchaToken = typeof input.captchaToken === 'string' ? input.captchaToken.slice(0, 4000) : ''
  if (!captchaToken) return answer({ ok: false, error: 'Please confirm you’re not a robot.' }, 400)

  const zoho = await postZohoWebForm({
    action: ZOHO_QUOTE_REQUEST.action,
    body: zohoQuoteRequestBody(values, captchaToken),
    tag: 'zoho-quote-request',
    userAgent: request.headers.get('user-agent'),
    ip: await clientIp(request),
  })
  if (zoho.outcome === 'accepted') return answer({ ok: true })
  if (zoho.outcome === 'refused') {
    const { status, location, excerpt } = zoho
    return answer({ ok: false, error: 'We could not verify that you’re not a robot. Please tick the box again.', zoho: { status, location, excerpt } }, 400)
  }
  return answer({ ok: false, error: SEND_FAILED })
}
