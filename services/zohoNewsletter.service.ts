import { SITE_URL } from '@/config/site'
import { ZOHO_FORMS } from '@/lib/data/zohoForms'
import { zohoAccepted } from '@/lib/zohoQuoteForm'

const FORM = ZOHO_FORMS.newsletter
const ZOHO_TIMEOUT_MS = 20_000

/**
 * `accepted`: Zoho created the Contact. `refused`: Zoho answered and did not
 * (most likely the captcha). `unavailable`: Zoho did not answer.
 */
export type ZohoNewsletterOutcome = 'accepted' | 'refused' | 'unavailable'

export type ZohoNewsletterSignup = {
  name: string
  email: string
  /** The reCAPTCHA v2 token from the form's checkbox, which Zoho verifies. */
  captchaToken: string
  userAgent?: string | null
  ip?: string | null
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
 * `returnURL` goes as `null` so Zoho answers with its own confirmation page,
 * which is how the quote form tells an accepted post from a refused one
 * (`zohoAccepted`, observed on that form on 2026-10-30). That this form answers
 * the same way is not yet confirmed with a real signup: every answer is logged
 * so the first one shows it.
 */
export async function sendZohoNewsletter(signup: ZohoNewsletterSignup): Promise<ZohoNewsletterOutcome> {
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
    if (zohoAccepted(res.status, text)) {
      console.info('[zoho-newsletter] accepted', { ms })
      return 'accepted'
    }
    console.error('[zoho-newsletter] not accepted', {
      status: res.status,
      location: res.headers.get('location') ?? '',
      ms,
      text: text.slice(0, 500),
    })
    return res.status >= 500 ? 'unavailable' : 'refused'
  } catch (error) {
    console.error('[zoho-newsletter] no answer from Zoho', { ms: Date.now() - started, error })
    return 'unavailable'
  }
}
