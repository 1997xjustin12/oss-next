import { logBackendRejection } from '@/lib/backendError'
import type { AccountDetailsPayload, AuthSession, ProfileUpdatePayload, RegisterPayload, User, UserProfile } from '@/types/user'

const BACKEND_URL = process.env.NEXT_OSS_BACKEND_URL
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

const LOGIN_URL = `${BACKEND_URL}api/auth/login`
const PROFILE_URL = `${BACKEND_URL}api/auth/profile`

// TODO: confirm the real refresh-token endpoint + request/response contract.
const REFRESH_URL = `${BACKEND_URL}api/auth/token/refresh`

// TODO: confirm the real reset-password endpoint + request/response contract
// — this is the follow-up step after requestPasswordReset (lost-password)
// emails a token+uidb64 link, distinct from that request-a-reset-email flow.
const RESET_PASSWORD_URL = `${BACKEND_URL}api/auth/reset-password`

// TODO: confirm the real change-password endpoint + request/response
// contract — distinct from updateAccountDetails, which only covers
// name/email.
const CHANGE_PASSWORD_URL = `${BACKEND_URL}api/auth/change-password`

// TODO: confirm the real registration endpoint + request/response contract
// against the OSS backend — placeholder assumed to mirror LOGIN_URL and to
// auto-login the new user by returning an AuthSession.
const REGISTER_URL = `${BACKEND_URL}api/auth/register`

// Confirmed 2026-10-14 against the backend's own schema: POST {email}. The
// `lost-password/` this used to point at does not exist there — it 404'd, so
// no reset email was ever sent from this app.
const FORGOT_PASSWORD_URL = `${BACKEND_URL}api/auth/forgot-password`


// The OSS backend's exact auth response shape isn't documented. Different
// Django/DRF auth setups nest the user under `user`, flatten it at the top
// level, or use `first_name`/`last_name` instead of a single display name.
// Normalize whatever comes back instead of trusting it blindly — falls back
// to the submitted identifier so the caller still gets a usable user even if
// the backend omits profile info entirely.
function normalizeUser(rawUser: Record<string, unknown>, fallbackIdentifier: string): User {
  const firstName = rawUser.first_name as string | undefined
  const lastName = rawUser.last_name as string | undefined
  const rawProfile = (rawUser.profile ?? {}) as Record<string, unknown>

  const profile: UserProfile = {
    billingAddress: rawProfile.billing_address as string | undefined,
    billingCity: rawProfile.billing_city as string | undefined,
    billingCountry: rawProfile.billing_country as string | undefined,
    billingState: rawProfile.billing_state as string | undefined,
    billingZip: rawProfile.billing_zip as string | undefined,
    shippingAddress: rawProfile.shipping_address as string | undefined,
    shippingCity: rawProfile.shipping_city as string | undefined,
    shippingCountry: rawProfile.shipping_country as string | undefined,
    shippingState: rawProfile.shipping_state as string | undefined,
    shippingZip: rawProfile.shipping_zip as string | undefined,
    phone: rawProfile.phone as string | undefined,
  }

  return {
    id: String(rawUser.id ?? rawUser.pk ?? fallbackIdentifier),
    username: (rawUser.username as string | undefined) ?? fallbackIdentifier,
    email: (rawUser.email as string | undefined) ?? '',
    firstName,
    lastName,
    displayName:
      (rawUser.displayName as string | undefined) ?? ([firstName, lastName].filter(Boolean).join(' ') || undefined),
    // Backend profile flag; left undefined if the response omits it, so callers
    // can distinguish "not subscribed" from "unknown".
    isSubscribed: rawUser.is_subscribed as boolean | undefined,
    profile,
  }
}

export async function getUserProfile(token: string): Promise<User> {
  const res = await fetch(PROFILE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? data?.detail ?? 'Could not load account details.')
  }

  const rawUser = (data?.user ?? data ?? {}) as Record<string, unknown>
  return normalizeUser(rawUser, '')
}

// Same uncertainty as normalizeUser applies to the token field: SimpleJWT
// uses `access`, DRF TokenAuth uses `token`/`key`, djoser uses `auth_token`.
// Login/register responses from this backend appear to return tokens only
// (no embedded user) — when that's the case, fetch the profile separately
// via GET /api/auth/profile using the freshly issued token.
async function normalizeSession(data: Record<string, unknown>, fallbackUsername: string): Promise<AuthSession> {
  const token = (data.access ?? data.token ?? data.key ?? data.auth_token) as string | undefined
  // SimpleJWT logins typically return both `access` and `refresh` — only
  // used later for the background refresh cycle when present.
  const refreshToken = data.refresh as string | undefined

  if (!token) {
    console.error('[normalizeSession] no recognizable token field in response:', Object.keys(data))
    throw new Error('Unexpected response from server: missing auth token.')
  }

  if (data.user) {
    return { user: normalizeUser(data.user as Record<string, unknown>, fallbackUsername), token, refreshToken }
  }

  const user = await getUserProfile(token).catch((err) => {
    console.error('[normalizeSession] profile fetch failed, using fallback user:', err)
    return normalizeUser({}, fallbackUsername)
  })

  return { user, token, refreshToken }
}

async function postLogin(username: string, password: string) {
  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
    },
    body: JSON.stringify({ username, password }),
  })

  return { ok: res.ok, data: (await res.json().catch(() => null)) as Record<string, unknown> | null }
}

/**
 * Sign in by username or by email address.
 *
 * The backend authenticates on `username` only — proven 2026-10-14: an
 * account answers 200 for its username and 401 for its email address. So
 * customers who chose a username at registration sign in with that.
 *
 * Accounts registered here before the form asked for a username got one
 * derived from their email (`usernameFromEmail`), and only know their email.
 * So: try what they typed, and only if that is refused, try the username their
 * email derives to. That order matters. Transforming first would break every
 * account whose username is not derived from anything — and the extra request
 * only ever happens on a failed attempt.
 *
 * The refusal reported is the first one, about what they actually typed.
 */
export async function loginUser(identifier: string, password: string): Promise<AuthSession> {
  const typed = await postLogin(identifier, password)
  if (typed.ok) return await normalizeSession(typed.data ?? {}, identifier)

  const derived = usernameFromEmail(identifier)
  if (derived !== identifier) {
    const asUsername = await postLogin(derived, password)
    if (asUsername.ok) return await normalizeSession(asUsername.data ?? {}, derived)
  }

  throw new Error(
    (typed.data?.error as string | undefined) ??
      (typed.data?.detail as string | undefined) ??
      'Invalid username or password.',
  )
}

/**
 * Ask the backend to email a reset link.
 *
 * It takes `{email}` only, and answers 200 "If the email exists, a reset link
 * has been sent." for every address — so this cannot be used to discover which
 * emails have accounts, and neither should anything built on it.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(FORGOT_PASSWORD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    logBackendRejection('user.service forgot-password', res.status, data)
    throw new Error(data?.error ?? data?.detail ?? fieldErrorMessage(data) ?? 'Could not send reset link. Please try again.')
  }
}

/**
 * The body the backend's register endpoint actually wants.
 *
 * It was being sent the form's own field names — `firstName`, `lastName`,
 * `contactNumber` — and none of them exist there. Asked directly, it answers:
 *
 *   {"username": ["This field is required."],
 *    "first_name": ["This field is required."],
 *    "last_name": ["This field is required."],
 *    "password2": ["This field is required."]}
 *
 * So: snake_case, a `username`, and the password twice. Those six fields are
 * the whole contract — its OPTIONS schema lists nothing else, and a
 * `contact_number` or `company_name` sent alongside is silently dropped
 * (checked 2026-10-14: the profile's `phone` came back empty).
 *
 * `username` is chosen by the customer on the form. The backend allows only
 * letters, numbers and underscores, and logs in by username alone — a login by
 * email address is refused (proven 2026-10-14).
 *
 * `password2` is the confirmation. The form already makes the customer type
 * it twice and checks they match before submitting, so sending the same value
 * is the truthful thing to send rather than a second prompt.
 */
function toBackendRegisterBody(payload: RegisterPayload) {
  return {
    username: payload.username.trim(),
    email: payload.email.trim(),
    first_name: payload.firstName,
    last_name: payload.lastName,
    password: payload.password,
    password2: payload.password,
  }
}

/**
 * How this app used to make a username, before the register form asked for
 * one: the email with every character the backend refuses turned into `_`.
 * Kept only so accounts created that way can still sign in with their email —
 * see `loginUser`.
 */
function usernameFromEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
}

export async function registerUser(payload: RegisterPayload): Promise<AuthSession> {
  const body = toBackendRegisterBody(payload)

  const res = await fetch(REGISTER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    /**
     * Log the backend's own words before they are thrown away.
     *
     * This function used to fall straight to "Registration failed. Please try
     * again." whenever the body carried neither `error` nor `detail` — and a
     * Django REST field error carries neither. It is
     * `{"email": ["user with this email already exists."]}`, so every
     * duplicate address, weak password and malformed phone number arrived as
     * the same unactionable sentence, with nothing in the logs either. That is
     * the same hole `logBackendRejection` was added for in the order service
     * on 2026-09-15; registration never got it.
     */
    logBackendRejection('user.service register', res.status, data)

    throw new Error(
      data?.error ?? data?.detail ?? fieldErrorMessage(data) ?? 'Registration failed. Please try again.',
    )
  }

  /**
   * Registration does not sign anyone in, so this does.
   *
   * The endpoint answers 201 with the created user's fields and nothing else
   * — `{username, email, first_name, last_name}`, no `access`, no `refresh`
   * (proven 2026-10-14). This used to hand that straight to
   * `normalizeSession`, which found no token and threw "Unexpected response
   * from server: missing auth token." *after* the account had been created:
   * the customer saw a server error, and a second attempt then told them the
   * email was already taken.
   *
   * The account exists by this point, so a failure here is no longer about
   * registration. Say so plainly and send them to the login form rather than
   * letting them try to register again.
   */
  return await loginUser(body.username, payload.password).catch((err) => {
    console.error('[user.service register] account created but sign-in failed', err)
    throw new Error('Your account was created, but we could not sign you in. Please log in.')
  })
}

/**
 * A readable sentence from a Django REST field-error body.
 *
 * `{"email": ["user with this email already exists."]}` becomes
 * "Email: user with this email already exists." — which tells the customer
 * what to change, where the generic fallback did not.
 *
 * Returns undefined for anything that is not that shape, so the caller's
 * fallback still applies rather than this inventing a message.
 */
function fieldErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return undefined

  const parts = Object.entries(data as Record<string, unknown>)
    .map(([field, value]) => {
      const text = Array.isArray(value)
        ? value.filter((v) => typeof v === 'string').join(' ')
        : typeof value === 'string'
          ? value
          : ''
      if (!text) return ''
      // `non_field_errors` is DRF's name for "this is about the record, not a
      // field" — prefixing it with a label would read as nonsense.
      if (field === 'non_field_errors') return text
      const label = field.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
      return `${label}: ${text}`
    })
    .filter(Boolean)

  return parts.length ? parts.join(' ') : undefined
}

// TODO: confirm the real field name for the rotated access token — assumed
// `access` (SimpleJWT convention), matching normalizeSession above.
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(REFRESH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? data?.detail ?? 'Could not refresh session. Please log in again.')
  }

  const access = data?.access ?? data?.token
  if (!access) {
    throw new Error('Unexpected response from server: missing refreshed token.')
  }

  return access as string
}

export async function resetPassword(token: string, uidb64: string, newPassword: string): Promise<void> {
  const res = await fetch(RESET_PASSWORD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
    },
    body: JSON.stringify({ token, uidb64, new_password: newPassword }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? data?.detail ?? 'Could not reset password. The link may have expired.')
  }
}

export async function changePassword(token: string, oldPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(CHANGE_PASSWORD_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? data?.detail ?? 'Could not change password. Please try again.')
  }
}

// PUT /api/auth/profile — same URL as GET, different verb. The backend takes a
// full-object replace, not a partial patch, so `payload.profile` must already be
// the caller's current full profile merged with whatever fields they edited, or
// the un-sent fields come back empty.
export async function updateAccountDetails(token: string, payload: AccountDetailsPayload): Promise<User> {
  const profile = payload.profile ?? {}
  const wirePayload: ProfileUpdatePayload = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    profile: {
      phone: profile.phone ?? '',
      billing_address: profile.billingAddress ?? '',
      billing_country: profile.billingCountry ?? '',
      billing_city: profile.billingCity ?? '',
      billing_state: profile.billingState ?? '',
      billing_zip: profile.billingZip ?? '',
      shipping_address: profile.shippingAddress ?? '',
      shipping_country: profile.shippingCountry ?? '',
      shipping_city: profile.shippingCity ?? '',
      shipping_state: profile.shippingState ?? '',
      shipping_zip: profile.shippingZip ?? '',
    },
  }

  const res = await fetch(PROFILE_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(wirePayload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? data?.detail ?? 'Could not update account details. Please try again.')
  }

  const rawUser = (data?.user ?? data ?? {}) as Record<string, unknown>
  return normalizeUser(rawUser, payload.email)
}
