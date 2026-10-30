import { NextResponse } from 'next/server'
import { SITE_URL } from '@/config/site'
import { ROUTES } from '@/config/routes'
import { checkRateLimit } from '@/lib/agentApi'
import { clientIp } from '@/lib/clientIp'
import { CONTACT_NUMBER } from '@/lib/helpers'
import {
  ZOHO_HONEYPOT,
  ZOHO_QUOTE_FORM,
  pickZohoQuote,
  validateZohoQuote,
  zohoAccepted,
  zohoQuoteBody,
  type ZohoQuoteResult,
} from '@/lib/zohoQuoteForm'

/**
 * Sends the Zoho quote form (lib/zohoQuoteForm.ts) to Zoho CRM and says whether
 * Zoho took it.
 *
 * The form could post to Zoho straight from the browser, as Zoho's embed does,
 * but then the page cannot read the answer (another origin), so a refused
 * submission would still show the visitor "thank you". Sent from here, the
 * answer is read, and the form moves on only when Zoho accepted it.
 *
 * How Zoho answers, observed 2026-10-30: a refused post is a 302 back to the
 * page it came from (wrong form keys) or to zoho.com (nothing posted). An
 * accepted one redirects to the form's `returnURL`. So `returnURL` is set to an
 * address only an accepted post is sent to, and a redirect there is success;
 * anything else is a failure, logged with what Zoho said.
 *
 * POST { firstName, lastName, phone, email, street, city, state, zip, <honeypot> }
 *   200 { ok: true }
 *   400 { ok: false, error }   a required field missing (the form checks first)
 *   429 { ok: false, error }   more than 5 a minute from one visitor (`quote` bucket)
 *   200 { ok: false, error, zoho }   Zoho refused it, or did not answer. Not a 5xx:
 *                              Cloudflare (in front of the site) replaces a 5xx from
 *                              here with its own error page, and the form then
 *                              cannot read the reason. `zoho` is what Zoho answered
 *                              (status, redirect, the start of its page), while the
 *                              success check is being confirmed against real posts.
 */

/**
 * Room for Zoho to answer. A valid post creates the Contact (and runs any Zoho
 * workflows) before Zoho replies, which can take far longer than a refusal
 * (about 1s); cut off by the platform's default limit, the visitor saw an error
 * for a submission Zoho had in fact taken (2026-10-30).
 */
export const maxDuration = 30
const ZOHO_TIMEOUT_MS = 20_000

/** Where Zoho sends an accepted submission. Never followed: only compared. */
const ACCEPTED_URL = `${SITE_URL}${ROUTES.SAVED_QUOTES}?zoho=sent`

const SEND_FAILED = `We couldn't send your details just now. Please try again, or call us at ${CONTACT_NUMBER}.`

function answer(result: ZohoQuoteResult, status = 200) {
  return NextResponse.json(result, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const limit = await checkRateLimit(request, 'quote')
  if (!limit.allowed) {
    return answer({ ok: false, error: 'Too many requests. Please wait a minute and try again.' }, 429)
  }

  const input: unknown = await request.json().catch(() => null)
  const values = pickZohoQuote(input)

  // A bot filled the field no person sees: answer as if sent, send nothing.
  const honeypot = (input as Record<string, unknown> | null)?.[ZOHO_HONEYPOT]
  if (typeof honeypot === 'string' && honeypot) return answer({ ok: true })

  const problem = validateZohoQuote(values)
  if (problem) return answer({ ok: false, error: problem }, 400)

  const ip = await clientIp(request)
  const started = Date.now()
  try {
    const res = await fetch(ZOHO_QUOTE_FORM.action, {
      method: 'POST',
      body: zohoQuoteBody(values, ACCEPTED_URL),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        // As the browser would send them: Zoho redirects a refused post to the
        // Referer, and may check the form is posted from our site.
        Origin: SITE_URL,
        Referer: `${SITE_URL}/`,
        'User-Agent': request.headers.get('user-agent') ?? 'Mozilla/5.0',
        ...(ip ? { 'X-Forwarded-For': ip } : {}),
      },
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(ZOHO_TIMEOUT_MS),
    })
    const location = res.headers.get('location') ?? ''
    const ms = Date.now() - started
    // Every answer, accepted or not: what Zoho said and how long it took is the
    // first thing to look at when a submission goes wrong.
    if (zohoAccepted(res.status, location, ACCEPTED_URL)) {
      console.info('[zoho-quote] accepted', { status: res.status, ms })
      return answer({ ok: true })
    }

    const raw = res.status < 300 ? await res.text() : ''
    // The page's words, without its markup, styles and scripts: what Zoho told the visitor.
    const body = raw
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 800)
    console.error('[zoho-quote] not accepted', { status: res.status, location, ms, body })
    return answer({ ok: false, error: SEND_FAILED, zoho: { status: res.status, location, ms, body } })
  } catch (error) {
    const ms = Date.now() - started
    console.error('[zoho-quote] no answer from Zoho', { ms, error })
    return answer({ ok: false, error: SEND_FAILED, zoho: { ms, error: String(error).slice(0, 200) } })
  }
}
