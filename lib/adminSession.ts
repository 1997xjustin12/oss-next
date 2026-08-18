// The admin session cookie: issue, verify, clear.
//
// Why a second cookie at all, when the user is already logged in? Because
// nothing the storefront login leaves behind can be trusted by a gate:
//
//   - the real session (token + user) lives in localStorage, which the proxy
//     cannot read — it never travels with the request;
//   - the `isLoggedIn` cookie is deliberately `httpOnly: false` so client code
//     can see it, which means any visitor can set it from a console.
//
// So this module mints its own: an HMAC-signed, httpOnly cookie, issued only
// after the backend has authenticated the credentials AND the returned identity
// matched the allowlist in config/admin.ts. The proxy can verify it without a
// round-trip and without decoding anyone's session token.
//
// Web Crypto rather than node:crypto throughout — the proxy runs on the Edge
// runtime, where node:crypto is not available.

import { ADMIN_SESSION_TTL_SECONDS } from '@/config/admin'

export const ADMIN_COOKIE = 'oss_admin'

/** Payload carried in the signed token. Kept tiny — it rides on every request. */
type AdminTokenPayload = {
  /** The identity that matched the allowlist, for the audit trail. */
  u: string
  /** Expiry, epoch seconds. */
  exp: number
}

function secret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET
  // A blank or absent secret must never mean "sign with an empty key" — that
  // would produce a forgeable token. No secret, no admin session, anywhere.
  return value && value.length >= 16 ? value : null
}

function b64urlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Returns Uint8Array<ArrayBuffer> rather than a bare Uint8Array: crypto.subtle
// takes a BufferSource, which excludes views that might sit on a
// SharedArrayBuffer. Allocating the buffer explicitly pins the type.
function b64urlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function hmacKey(rawSecret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(rawSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

/**
 * Mint a token for an already-authenticated, already-allowlisted identity.
 *
 * Returns null when no usable secret is configured, so the caller sets no
 * cookie at all rather than one that cannot be verified later.
 */
export async function signAdminToken(username: string): Promise<string | null> {
  const rawSecret = secret()
  if (!rawSecret) {
    console.error('[adminSession] ADMIN_SESSION_SECRET is unset or too short — refusing to issue an admin session.')
    return null
  }

  const payload: AdminTokenPayload = {
    u: username,
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS,
  }

  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(rawSecret), new TextEncoder().encode(body))

  return `${body}.${b64urlEncode(new Uint8Array(signature))}`
}

/**
 * Verify a token and return the identity it carries, or null.
 *
 * Every failure path returns null and says nothing about which check failed —
 * a caller that distinguished "bad signature" from "expired" would hand an
 * attacker a probe. Signature is checked before the payload is trusted, so an
 * expired-looking token still costs a forger a valid MAC.
 */
export async function verifyAdminToken(token: string | undefined): Promise<string | null> {
  if (!token) return null

  const rawSecret = secret()
  if (!rawSecret) return null

  const [body, signature] = token.split('.')
  if (!body || !signature) return null

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(rawSecret),
      b64urlDecode(signature),
      new TextEncoder().encode(body),
    )
    if (!valid) return null

    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as AdminTokenPayload
    if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) return null
    if (typeof payload.u !== 'string' || !payload.u) return null

    return payload.u
  } catch {
    // Malformed base64, malformed JSON, anything else — all the same answer.
    return null
  }
}

/** Cookie attributes, shared by the issue and clear paths so they can't drift. */
export function adminCookieOptions(maxAge: number) {
  return {
    // The whole point: unreadable and unsettable from client JavaScript.
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // 'strict' would drop the cookie when an admin follows a link into /admin
    // from anywhere off-site, which reads as a random 404. 'lax' still blocks
    // cross-site POSTs, and the admin actions re-check on their own besides.
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}
