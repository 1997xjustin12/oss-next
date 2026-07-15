const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

// Verifies a reCAPTCHA token against Google's siteverify endpoint.
// RECAPTCHA_SECRET_KEY isn't configured in this environment yet — returns
// false (rather than throwing) so callers can surface a clean 4xx instead of
// a 500 until the key is added.
export async function verifyRecaptcha(token: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.error('[verifyRecaptcha] RECAPTCHA_SECRET_KEY is not configured')
    return false
  }

  if (!token) return false

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET_KEY, response: token }),
    })
    const data = await res.json().catch(() => null)
    return Boolean(data?.success)
  } catch (err) {
    console.error('[verifyRecaptcha] request failed:', err)
    return false
  }
}
