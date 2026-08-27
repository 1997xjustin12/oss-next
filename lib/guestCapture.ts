const EMAIL_KEY = 'oss-guest-email'
const DISMISSED_AT_KEY = 'oss-guest-capture-dismissed-at'
// Re-ask eventually (e.g. they come back on a different device/browser
// profile), but never on every visit — that's the "annoying" failure mode.
const DISMISS_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const LEAD_KEY = 'oss-guest-lead'

/**
 * The fuller set of details the PDP asks a guest for before adding a container
 * to the cart. The exit-intent prompt only ever wanted an email; this is the
 * same person, asked at a different moment.
 */
export type GuestLead = {
  fullName: string
  email: string
  phone: string
  address: string
  /** ISO timestamp, so a stale lead can be spotted later. */
  capturedAt: string
}

export function getGuestEmail(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(EMAIL_KEY)
  } catch {
    // Safari private mode throws rather than returning null.
    return null
  }
}

export function getGuestLead(): GuestLead | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(LEAD_KEY)
    if (!raw) return null

    const lead = JSON.parse(raw) as GuestLead
    return typeof lead?.email === 'string' && lead.email ? lead : null
  } catch {
    return null
  }
}

/**
 * Store the lead, and write the email into the key the exit-intent prompt
 * reads.
 *
 * That second write is the point: `isGuestCaptureSuppressed()` treats a known
 * email as "nothing left to ask for", so capturing details here stops the same
 * person being asked again on their way out. Two prompts chasing one visitor is
 * how a helpful ask turns into an annoying one.
 */
export function setGuestLead(lead: Omit<GuestLead, 'capturedAt'>): void {
  try {
    localStorage.setItem(
      LEAD_KEY,
      JSON.stringify({ ...lead, capturedAt: new Date().toISOString() } satisfies GuestLead),
    )
    localStorage.setItem(EMAIL_KEY, lead.email)
  } catch {
    // Storage unavailable — the lead is still handed to the caller, so the
    // only thing lost is not asking again next time.
  }
}

export function setGuestEmail(email: string): void {
  try {
    localStorage.setItem(EMAIL_KEY, email)
  } catch {
    // See getGuestEmail — storage can throw outright.
  }
}

export function dismissGuestCapture(): void {
  try {
    localStorage.setItem(DISMISSED_AT_KEY, Date.now().toString())
  } catch {
    // Without this the guest is asked again next visit, which is the
    // acceptable failure.
  }
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
