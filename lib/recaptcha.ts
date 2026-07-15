const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

// Callers should skip the reCAPTCHA check entirely when this is false, rather
// than calling verifyRecaptcha() and treating an unconfigured key as a
// rejection — reCAPTCHA is optional until a secret key is actually set.
export function isRecaptchaConfigured(): boolean {
  return Boolean(RECAPTCHA_SECRET_KEY)
}

// Verifies a reCAPTCHA token against Google's siteverify endpoint. Only call
// this when isRecaptchaConfigured() is true.
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
