const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

/**
 * Below this, the visitor is treated as a bot.
 *
 * v3 does not pass or fail — it returns a score from 0.0 to 1.0 and leaves the
 * judgement to us. 0.5 is Google's own suggested starting point. Raising it
 * rejects more real people; lowering it lets more scripts through, and there
 * is no setting that does neither.
 *
 * Configurable because the right number depends on traffic this code cannot
 * see. Worth revisiting once the logs below show what real submissions score.
 */
const SCORE_THRESHOLD = Number(process.env.RECAPTCHA_MIN_SCORE ?? '0.5')

// Callers should skip the reCAPTCHA check entirely when this is false, rather
// than calling verifyRecaptcha() and treating an unconfigured key as a
// rejection — reCAPTCHA is optional until a secret key is actually set.
export function isRecaptchaConfigured(): boolean {
  return Boolean(RECAPTCHA_SECRET_KEY)
}

type SiteVerifyResponse = {
  success?: boolean
  score?: number
  action?: string
  'error-codes'?: string[]
}

/**
 * Verifies a reCAPTCHA v3 token. Only call this when `isRecaptchaConfigured()`.
 *
 * Three things have to hold, and the old version checked one of them:
 *
 *   1. `success` — the token is well-formed, unexpired and ours;
 *   2. `score` — the visitor scored at or above the threshold;
 *   3. `action` — the token was minted for the thing being done.
 *
 * The third is what stops a token harvested from a cheap form being replayed
 * against an expensive one. It is only checked when the caller names an
 * expected action, so a caller that does not care still works.
 *
 * Every refusal is logged with its reason. Without that, a wrong key, a
 * too-high threshold and an actual bot are indistinguishable from the outside
 * — all three are just a form that will not submit.
 */
export async function verifyRecaptcha(token: string, expectedAction?: string): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.error('[verifyRecaptcha] RECAPTCHA_SECRET_KEY is not configured')
    return false
  }

  if (!token) {
    console.warn('[verifyRecaptcha] no token supplied — action:', expectedAction ?? '(none)')
    return false
  }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET_KEY, response: token }),
    })
    const data = (await res.json().catch(() => null)) as SiteVerifyResponse | null

    if (!data?.success) {
      console.warn('[verifyRecaptcha] rejected — codes:', data?.['error-codes']?.join(',') ?? 'none')
      return false
    }

    if (expectedAction && data.action && data.action !== expectedAction) {
      console.warn('[verifyRecaptcha] action mismatch — expected, got:', expectedAction, data.action)
      return false
    }

    // Absent on a v2 token. Treated as a pass so a v2 key still works if one
    // is ever configured, rather than locking every form behind a score that
    // will never arrive.
    if (typeof data.score === 'number' && data.score < SCORE_THRESHOLD) {
      console.warn('[verifyRecaptcha] low score — score, threshold:', data.score, SCORE_THRESHOLD)
      return false
    }

    return true
  } catch (err) {
    console.error('[verifyRecaptcha] request failed:', err)
    return false
  }
}
