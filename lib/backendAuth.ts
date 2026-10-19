import { headers } from 'next/headers'
import { clientIpFromHeaders } from '@/lib/clientIp'

/**
 * Who the backend should count a call against.
 *
 * Since the backend's change of 18 October 2026 (bqq_backend 7a2a494) it rate
 * limits per visitor and locks sign-in after repeated wrong passwords. A call
 * from this server that does not say who the visitor is looks like the
 * storefront itself, so every shopper would share one count and one abusive
 * visitor could get everyone a 429 — sign-in, registration, password reset,
 * guest checkout. The rule, from the backend's checklist:
 *
 * - **Signed in:** `Authorization: Bearer <access token>`. Counted per customer.
 *   One Authorization header cannot carry both, so no key here.
 * - **Not signed in:** `Authorization: Api-Key <storefront key>` and
 *   `X-Client-IP: <visitor IP>`. The backend only believes X-Client-IP on a
 *   request carrying a valid key, so the address is not sent without one.
 *
 * The key is NEXT_OSS_BACKEND_KEY, server-only. It must never reach a
 * NEXT_PUBLIC_ variable or the browser.
 */

const BACKEND_KEY = process.env.NEXT_OSS_BACKEND_KEY

/**
 * The visitor's address for the request being handled, or null.
 *
 * Read from `headers()`, so it works in route handlers, Server Actions and
 * server rendering without threading the Request through every service. Null
 * outside a request — and must not be called inside `'use cache'`, where a
 * shared answer has no single visitor (those callers pass `ip: null`).
 *
 * Trusts x-forwarded-for / x-real-ip, which Vercel overwrites on every request.
 * If this ever runs behind Cloudflare or nginx instead, switch lib/clientIp.ts
 * to that proxy's real-IP header — a header the visitor can type would let
 * them reset their own limit.
 */
export async function visitorIp(): Promise<string | null> {
  try {
    return await clientIpFromHeaders(await headers())
  } catch {
    return null
  }
}

type Options = {
  /** The customer's access token when signed in. */
  token?: string | null
  /**
   * The visitor's address. Omit to read it from the current request; pass
   * `null` where there is no single visitor (a shared cache).
   */
  ip?: string | null
}

/**
 * The Authorization (and X-Client-IP) headers for a backend call made on behalf
 * of a visitor. Spread into the call's own headers.
 *
 * With no token and no key configured it returns nothing, which is how these
 * calls were sent before the key existed — still accepted, just counted by the
 * storefront's address.
 */
export async function visitorAuthHeaders({ token, ip }: Options = {}): Promise<Record<string, string>> {
  if (token) return { Authorization: `Bearer ${token}` }
  if (!BACKEND_KEY) return {}

  const address = ip === undefined ? await visitorIp() : ip
  // Omit rather than send an empty value or "unknown" — the backend would count
  // every such request as one visitor.
  return address
    ? { Authorization: `Api-Key ${BACKEND_KEY}`, 'X-Client-IP': address }
    : { Authorization: `Api-Key ${BACKEND_KEY}` }
}
