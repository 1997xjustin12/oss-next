import { NextResponse } from 'next/server'
import { SITE_URL } from '@/config/site'
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
 * How Zoho answers this form, observed with real submissions on 2026-10-30: an
 * accepted post is HTTP 200 with Zoho's thank-you page ("…submitted
 * successfully…"), in under a second; a refused one is a 302, back to the
 * Referer (wrong form keys) or to zoho.com (nothing posted). See zohoAccepted.
 * Anything else is a failure, logged with what Zoho said.
 *
 * POST { firstName, lastName, phone, email, street, city, state, zip, <honeypot> }
 *   200 { ok: true }
 *   400 { ok: false, error }   a required field missing (the form checks first)
 *   429 { ok: false, error }   more than 5 a minute from one visitor (`quote` bucket)
 *   200 { ok: false, error }   Zoho refused it, or did not answer.
 *
 * Never a 5xx: Cloudflare, in front of the site, replaces a 5xx from here with
 * its own error page, and the form could no longer read the reason
 * (2026-10-30, when an accepted submission was reported to the visitor as a
 * failure that way).
 */

/** Room for Zoho to answer: it takes under a second, but a slow day should not cost the lead. */
export const maxDuration = 30
const ZOHO_TIMEOUT_MS = 20_000

const SEND_FAILED = `We couldn't send your details just now. Please try again, or call us at ${CONTACT_NUMBER}.`

function answer(result: ZohoQuoteResult, status = 200) {
  return NextResponse.json(result, { status, headers: { 'Cache-Control': 'no-store' } })
}

/** The words of an HTML page, without its markup, styles, scripts or comments. */
function pageText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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
      body: zohoQuoteBody(values),
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
    const text = res.status === 200 ? pageText(await res.text()) : ''
    const ms = Date.now() - started
    // Every answer, accepted or not: what Zoho said and how long it took is the
    // first thing to look at when a submission goes wrong.
    if (zohoAccepted(res.status, text)) {
      console.info('[zoho-quote] accepted', { ms })
      return answer({ ok: true })
    }
    console.error('[zoho-quote] not accepted', {
      status: res.status,
      location: res.headers.get('location') ?? '',
      ms,
      text: text.slice(0, 500),
    })
    return answer({ ok: false, error: SEND_FAILED })
  } catch (error) {
    console.error('[zoho-quote] no answer from Zoho', { ms: Date.now() - started, error })
    return answer({ ok: false, error: SEND_FAILED })
  }
}
