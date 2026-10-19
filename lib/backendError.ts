/**
 * The backend's own reason for refusing a request, for the server log.
 *
 * The services look for `error`, `detail` or `message` on a failed response and
 * fall back to a fixed sentence — "Could not update cart." But the backend also
 * answers with field-level validation errors, `{ items: ["…"] }`, which carry
 * none of those three keys. Those were discarded entirely, so every log line
 * said the request failed and none said why: a signed-in customer's cart was
 * being refused on every save and the only record was "Could not update cart."
 *
 * Log-only. What a customer sees is decided separately: most services keep a
 * fixed sentence, while checkout passes the backend's reason through via
 * `backendErrorMessage` and `BackendRefusedError` below, so a refused order
 * says why.
 */
export function logBackendRejection(where: string, status: number, body: unknown): void {
  let reason: string
  try {
    reason = typeof body === 'string' ? body : JSON.stringify(body)
  } catch {
    reason = String(body)
  }
  console.error('[backendError] backend refused — where, status:', where, status, (reason ?? 'no body').slice(0, 800))
}

/**
 * A refusal whose message came from the backend and is fit to show a customer.
 *
 * Thrown by services when the backend answered with a reason. Anything else
 * that goes wrong — the network, a non-JSON reply, a bug — arrives as a plain
 * Error, so a route can tell "the backend said no, here is why" apart from
 * "something broke" and only pass the first kind through to the page.
 */
export class BackendRefusedError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'BackendRefusedError'
    this.status = status
  }
}

/** Long enough for any real reason, short enough that a stack trace is not one. */
const MAX_MESSAGE_LENGTH = 300

/**
 * A readable sentence from a Django REST field-error body.
 *
 * `{"email": ["user with this email already exists."]}` becomes
 * "Email: user with this email already exists." — which tells the customer
 * what to change, where a generic fallback does not. Nested errors, such as
 * `{"items": [{"price": ["…"]}]}`, are reached too and labelled by their
 * innermost field.
 *
 * Returns undefined for anything that is not that shape, so the caller's
 * fallback still applies rather than this inventing a message.
 */
export function fieldErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return undefined

  const parts: string[] = []

  const collect = (field: string, value: unknown) => {
    if (typeof value === 'string') {
      // `non_field_errors` is DRF's name for "this is about the record, not a
      // field" — prefixing it with a label would read as nonsense.
      if (field === 'non_field_errors') parts.push(value)
      else parts.push(`${field.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())}: ${value}`)
    } else if (Array.isArray(value)) {
      value.forEach((entry) => collect(field, entry))
    } else if (value && typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([inner, entry]) => collect(inner, entry))
    }
  }

  Object.entries(data as Record<string, unknown>).forEach(([field, value]) => collect(field, value))

  // The same sentence once per item line is noise, not information.
  const unique = [...new Set(parts)]
  return unique.length ? unique.join(' ') : undefined
}

/**
 * The backend's reason for a failed request, as one sentence — or undefined
 * when it gave none (a non-JSON body, such as a Django error page, gives none).
 * Checks `error`, `detail` and `message`, then field errors.
 */
export function backendErrorMessage(data: unknown): string | undefined {
  const body = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const direct = [body.error, body.detail, body.message].find(
    (value): value is string => typeof value === 'string' && value.trim() !== '',
  )
  const message = direct ?? fieldErrorMessage(data)
  if (!message) return undefined
  return message.length > MAX_MESSAGE_LENGTH ? `${message.slice(0, MAX_MESSAGE_LENGTH - 1)}…` : message
}

/**
 * The backend said 429: a per-visitor or per-customer limit, or the sign-in
 * lockout (5 wrong passwords for one username from one visitor in 15 minutes,
 * or 20 from anywhere in an hour — refused even with the right password until
 * the window passes).
 *
 * Its own class so it is never mistaken for a wrong password or a failure:
 * routes pass it through as a 429 with Retry-After (see rateLimitedReply), and
 * the customer is told to wait rather than to check their details. Never retry
 * on it.
 */
export class RateLimitedError extends BackendRefusedError {
  /** Seconds to wait, from the backend's Retry-After; null when it sent none. */
  retryAfter: number | null

  constructor(message: string, retryAfter: number | null) {
    super(429, message)
    this.name = 'RateLimitedError'
    this.retryAfter = retryAfter
  }
}

/** "about 12 minutes" / "about 40 seconds" — the lockout windows run from seconds to 15 minutes. */
function waitPhrase(seconds: number): string {
  if (seconds >= 90) return `about ${Math.ceil(seconds / 60)} minutes`
  if (seconds > 60) return 'about a minute'
  return `${Math.max(1, Math.round(seconds))} seconds`
}

/**
 * A RateLimitedError for a 429 reply, or null for anything else. Uses the
 * backend's own wording (its `detail`) and adds the wait from Retry-After.
 */
export function rateLimitedFrom(res: Response, data: unknown): RateLimitedError | null {
  if (res.status !== 429) return null

  const header = Number(res.headers.get('retry-after'))
  const retryAfter = Number.isFinite(header) && header > 0 ? Math.ceil(header) : null
  const base = backendErrorMessage(data) ?? 'Too many requests. Please wait a moment and try again.'
  const message = retryAfter ? `${base.replace(/\.?\s*$/, '.')} Please try again in ${waitPhrase(retryAfter)}.` : base

  return new RateLimitedError(message, retryAfter)
}

/**
 * The route-handler reply for a RateLimitedError — a 429 carrying the message
 * and Retry-After — or null for any other error, so a catch block can try this
 * first and fall through to its usual handling.
 */
export function rateLimitedReply(err: unknown): Response | null {
  if (!(err instanceof RateLimitedError)) return null
  return Response.json(
    { error: err.message },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        ...(err.retryAfter ? { 'Retry-After': String(err.retryAfter) } : {}),
      },
    },
  )
}
