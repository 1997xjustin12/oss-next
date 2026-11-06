import { SITE_URL } from '@/config/site'

const ZOHO_TIMEOUT_MS = 20_000

/**
 * `accepted`: Zoho created the record. `refused`: Zoho answered and did not
 * (most likely the captcha). `unavailable`: Zoho did not answer, or erred.
 */
export type ZohoWebFormOutcome = 'accepted' | 'refused' | 'unavailable'

/**
 * What Zoho answered, in brief: the status, where a redirect pointed, and the
 * start of the page's text. Logged, and returned to the browser with a refusal
 * so a failed submission can be diagnosed from the Network tab.
 */
export type ZohoWebFormAnswer = { outcome: ZohoWebFormOutcome; status: number | null; location: string; excerpt: string }

/**
 * Whether Zoho refused a web-form post, from its answer. Only what is known to
 * be a refusal counts as one; anything else is taken as accepted.
 *
 * The other way round (accepted only on the quote form's "submitted
 * successfully" wording) refused every newsletter signup on 2026-11-06 while
 * Zoho was creating the Contact: forms answer differently. Known refusals, from
 * the quote form (2026-10-30): a redirect back to the Referer (wrong form keys)
 * or to zoho.com (nothing posted). Plus a page that says the captcha, or the
 * submission, was not valid.
 */
export function zohoWebFormRefused(status: number, location: string, text: string): boolean {
  if (status >= 300 && status < 400) {
    let target: URL | null = null
    try {
      target = new URL(location, SITE_URL)
    } catch {
      return true
    }
    const backToReferer = target.origin === new URL(SITE_URL).origin && (target.pathname === '/' || target.pathname === '')
    return backToReferer || /(^|\.)zoho\.com$/i.test(target.hostname)
  }
  if (status === 200) return /captcha|not valid|invalid|went wrong/i.test(text)
  return true
}

/** The words of an HTML page, without its markup. */
function pageText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

type ZohoWebFormPost = {
  /** The form's `action`, Zoho's WebToContactForm endpoint. */
  action: string
  /** Every field, hidden values included, under Zoho's names. */
  body: URLSearchParams
  /** Log prefix, e.g. `zoho-newsletter`. */
  tag: string
  userAgent?: string | null
  ip?: string | null
}

/**
 * Posts a Zoho CRM web form server to server, as the browser would have from
 * the WordPress page: the same fields, with our site as Origin and Referer.
 * The caller sends `returnURL: 'null'` so Zoho answers with its own page rather
 * than a redirect to a thank-you page. Every answer is logged under `tag`.
 */
export async function postZohoWebForm({ action, body, tag, userAgent, ip }: ZohoWebFormPost): Promise<ZohoWebFormAnswer> {
  const started = Date.now()
  try {
    const res = await fetch(action, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        // As the browser would send them: Zoho redirects a refused post to the
        // Referer, and may check the form is posted from our site.
        Origin: SITE_URL,
        Referer: `${SITE_URL}/`,
        'User-Agent': userAgent ?? 'Mozilla/5.0',
        ...(ip ? { 'X-Forwarded-For': ip } : {}),
      },
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(ZOHO_TIMEOUT_MS),
    })
    const text = res.status === 200 ? pageText(await res.text()) : ''
    const ms = Date.now() - started
    const location = res.headers.get('location') ?? ''
    if (res.status >= 500) {
      console.error(`[${tag}] Zoho error`, { status: res.status, ms })
      return { outcome: 'unavailable', status: res.status, location, excerpt: '' }
    }
    if (zohoWebFormRefused(res.status, location, text)) {
      console.error(`[${tag}] refused`, { status: res.status, location, ms, text: text.slice(0, 500) })
      return { outcome: 'refused', status: res.status, location, excerpt: text.slice(0, 200) }
    }
    console.info(`[${tag}] accepted`, { status: res.status, location, ms, text: text.slice(0, 300) })
    return { outcome: 'accepted', status: res.status, location, excerpt: '' }
  } catch (error) {
    console.error(`[${tag}] no answer from Zoho`, { ms: Date.now() - started, error })
    return { outcome: 'unavailable', status: null, location: '', excerpt: error instanceof Error ? error.message.slice(0, 200) : '' }
  }
}
