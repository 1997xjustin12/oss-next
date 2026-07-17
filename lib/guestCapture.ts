const EMAIL_KEY = 'oss-guest-email'
const DISMISSED_AT_KEY = 'oss-guest-capture-dismissed-at'
// Re-ask eventually (e.g. they come back on a different device/browser
// profile), but never on every visit — that's the "annoying" failure mode.
const DISMISS_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export function getGuestEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(EMAIL_KEY)
}

export function setGuestEmail(email: string): void {
  localStorage.setItem(EMAIL_KEY, email)
}

export function dismissGuestCapture(): void {
  localStorage.setItem(DISMISSED_AT_KEY, Date.now().toString())
}

// True when the capture modal should stay hidden this visit — already have
// an email (nothing left to ask for), or the guest dismissed it recently.
export function isGuestCaptureSuppressed(): boolean {
  if (typeof window === 'undefined') return true
  if (getGuestEmail()) return true

  const dismissedAt = localStorage.getItem(DISMISSED_AT_KEY)
  if (!dismissedAt) return false
  return Date.now() - Number(dismissedAt) < DISMISS_COOLDOWN_MS
}
