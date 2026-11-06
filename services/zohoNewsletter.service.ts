import { SITE_URL } from '@/config/site'
import { ZOHO_FORMS } from '@/lib/data/zohoForms'

const FORM = ZOHO_FORMS.newsletter
const ZOHO_TIMEOUT_MS = 20_000

/**
 * `accepted`: Zoho created the Contact. `refused`: Zoho answered and did not
 * (most likely the captcha). `unavailable`: Zoho did not answer.
 */
export type ZohoNewsletterOutcome = 'accepted' | 'refused' | 'unavailable'

/**
 * What Zoho answered, in brief: the status, where a redirect pointed, and the
 * start of the page's text. Logged, and returned to the browser with a refusal
 * so a failed signup can be diagnosed from the Network tab.
 */
export type ZohoNewsletterAnswer = { outcome: ZohoNewsletterOutcome; status: number | null; location: string; excerpt: string }

export type ZohoNewsletterSignup = {
  name: string
  email: string
  /** The reCAPTCHA v2 token from the form's checkbox, which Zoho verifies. */
  captchaToken: string
  userAgent?: string | null
  ip?: string | null
}

/**
 * Whether Zoho refused a newsletter post, from its answer. Only what is known to
 * be a refusal counts as one; anything else is taken as accepted.
 *
 * The other way round (accepted only on the quote form's "submitted
 * successfully" wording) refused every signup on 2026-11-06, while Zoho was
 * creating the Contact: this form answers differently. Known refusals, from the
 * quote form (2026-10-30): a redirect back to the Referer (wrong form keys) or
 * to zoho.com (nothing posted). Plus a page that says the captcha, or the
 * submission, was not valid.
 */
export function zohoNewsletterRefused(status: number, location: string, text: string): boolean {
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

/**
 * Sends a newsletter signup to Zoho CRM's newsletter web form, server to
 * server, as the form on the WordPress pages did from the browser: the same
 * form keys, "Full Name" as Zoho's Last Name, and the visitor's captcha token.
 *
 * `returnURL` goes as `null` so Zoho answers with its own page rather than a
 * redirect to WordPress's thank-you page. How the answer is read:
 * `zohoNewsletterRefused`. Every answer is logged.
 */
export async function sendZohoNewsletter(signup: ZohoNewsletterSignup): Promise<ZohoNewsletterAnswer> {
  const body = new URLSearchParams({ ...FORM.hidden, returnURL: 'null' })
  const [nameField, emailField] = FORM.fields
  body.set(nameField.name, signup.name.trim().slice(0, nameField.maxLength))
  body.set(emailField.name, signup.email.trim().slice(0, emailField.maxLength))
  body.set('g-recaptcha-response', signup.captchaToken)

  const started = Date.now()
  try {
    const res = await fetch(FORM.action, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        // As the browser would send them: Zoho redirects a refused post to the
        // Referer, and may check the form is posted from our site.
        Origin: SITE_URL,
        Referer: `${SITE_URL}/`,
        'User-Agent': signup.userAgent ?? 'Mozilla/5.0',
        ...(signup.ip ? { 'X-Forwarded-For': signup.ip } : {}),
      },
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(ZOHO_TIMEOUT_MS),
    })
    const text = res.status === 200 ? pageText(await res.text()) : ''
    const ms = Date.now() - started
    const location = res.headers.get('location') ?? ''
    if (res.status >= 500) {
      console.error('[zoho-newsletter] Zoho error', { status: res.status, ms })
      return { outcome: 'unavailable', status: res.status, location, excerpt: '' }
    }
    if (zohoNewsletterRefused(res.status, location, text)) {
      console.error('[zoho-newsletter] refused', { status: res.status, location, ms, text: text.slice(0, 500) })
      return { outcome: 'refused', status: res.status, location, excerpt: text.slice(0, 200) }
    }
    // Logged in full while this form's answers are new: the first ones show
    // what an acceptance looks like.
    console.info('[zoho-newsletter] accepted', { status: res.status, location, ms, text: text.slice(0, 300) })
    return { outcome: 'accepted', status: res.status, location, excerpt: '' }
  } catch (error) {
    console.error('[zoho-newsletter] no answer from Zoho', { ms: Date.now() - started, error })
    return { outcome: 'unavailable', status: null, location: '', excerpt: error instanceof Error ? error.message.slice(0, 200) : '' }
  }
}
