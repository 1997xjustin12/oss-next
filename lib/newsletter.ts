// The newsletter, from the browser. Every newsletter UI calls these, so a
// signup reaches every list it belongs on without each form knowing which.
// They call our own route (app/api/subscribers), which sends to Zoho CRM and
// the Django backend; services/subscriber.service.ts is the backend side.
export type NewsletterResult = { ok: true } | { ok: false; error: string }

export type NewsletterSignup = {
  email: string
  /** "Full Name", which Zoho's newsletter form requires. */
  name?: string
  /**
   * The reCAPTCHA v2 token from the form's "I'm not a robot" box. With it, the
   * signup also goes to Zoho CRM, which checks it. Without it, Django only.
   */
  zohoCaptchaToken?: string | null
  /** The app's own reCAPTCHA v3 token, for a signup without the checkbox. */
  recaptchaToken?: string | null
}

/**
 * Subscribe someone to the newsletter: Zoho CRM and the Django backend when the
 * form carries Zoho's captcha (`NewsletterForm` does), the backend only when it
 * does not (the account page's toggle). Use this, never a direct post to Zoho.
 */
export async function subscribeToNewsletter(signup: NewsletterSignup): Promise<NewsletterResult> {
  try {
    const res = await fetch('/api/subscribers/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signup),
    })
    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return { ok: false, error: data?.error ?? 'Could not subscribe. Please try again.' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not subscribe. Please try again.' }
  }
}

/** Django only: a Zoho web form cannot unsubscribe anyone. */
export async function unsubscribeFromNewsletter(email: string): Promise<NewsletterResult> {
  try {
    const res = await fetch('/api/subscribers/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return { ok: false, error: data?.error ?? 'Could not unsubscribe. Please try again.' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not unsubscribe. Please try again.' }
  }
}
