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
const REGISTER_URL = `${BACKEND_URL}api/auth/register/`

// TODO: confirm the real password-reset endpoint + request/response contract
// against the OSS backend — placeholder assumed to mirror LOGIN_URL.
const LOST_PASSWORD_URL = `${BACKEND_URL}api/auth/lost-password/`


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

export async function loginUser(username: string, password: string): Promise<AuthSession> {
  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Store-Domain': STORE_DOMAIN ?? '',
    },
    body: JSON.stringify({ username, password }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? data?.detail ?? 'Invalid username or password.')
  }

  // TEMP DEBUG — remove once the real response shape is confirmed.
  console.log('[loginUser] raw response keys:', Object.keys(data ?? {}))

  return await normalizeSession(data ?? {}, username)
}

export async function requestPasswordReset(usernameOrEmail: string): Promise<void> {
  const res = await fetch(LOST_PASSWORD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usernameOrEmail }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error ?? data?.detail ?? 'Could not send reset link. Please try again.')
  }
}

export async function registerUser(payload: RegisterPayload): Promise<AuthSession> {
  const res = await fetch(REGISTER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error ?? data?.detail ?? 'Registration failed. Please try again.')
  }

  return await normalizeSession(data ?? {}, payload.email)
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
