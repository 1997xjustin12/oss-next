import { createHash } from 'node:crypto'
import { STORE_KEY } from '@/config/store'
import { getRedisClient, incrementWindow } from '@/lib/redis'

/**
 * Failed sign-ins per visitor, so reCAPTCHA can be required after a couple.
 *
 * Recommended by the backend's rate-limit checklist (2026-10-18). The login
 * form always sends a reCAPTCHA v3 token — v3 is invisible, so that costs the
 * customer nothing — but the login route only *enforces* it once this visitor
 * has failed LOGIN_FAILURES_BEFORE_RECAPTCHA times in the window. A person who
 * mistypes once is never challenged; a script guessing passwords is scored and
 * turned away before the backend's own lockout counts against the account.
 *
 * Counted per visitor address (hashed), in a 15-minute window matching the
 * backend's lockout. Fails open, like every limiter here: with Redis down the
 * count reads as zero and sign-in works as before.
 */

export const LOGIN_FAILURES_BEFORE_RECAPTCHA = 2
const WINDOW_SECONDS = 15 * 60

function failureKey(ip: string): string {
  const hashed = createHash('sha256').update(ip).digest('hex').slice(0, 24)
  return `oss-next:${STORE_KEY}:loginfail:${hashed}`
}

export async function recentLoginFailures(ip: string | null): Promise<number> {
  if (!ip) return 0
  try {
    return Number((await getRedisClient().get(failureKey(ip))) ?? 0)
  } catch {
    return 0
  }
}

export async function recordLoginFailure(ip: string | null): Promise<void> {
  if (!ip) return
  try {
    await incrementWindow(failureKey(ip), WINDOW_SECONDS)
  } catch {
    // A missed count only means one less challenge.
  }
}

export async function clearLoginFailures(ip: string | null): Promise<void> {
  if (!ip) return
  try {
    await getRedisClient().del(failureKey(ip))
  } catch {
    // Expires on its own within the window.
  }
}
