import { DEFAULT_ALLOWED_COUNTRIES } from '@/config/chat'

/**
 * Who may use the AI assistant.
 *
 * **Why there is a restriction at all:** every message costs a backend model
 * call, and the catalogue only ships to the US and Canada. The limit points
 * that spend at the markets we actually sell to.
 *
 * **What this is not:** it is IP geolocation. A VPN defeats it in both
 * directions — someone in Ohio on a UK exit node is refused, someone in London
 * on a US exit node is served. That is acceptable for a usage control. It is
 * **not** a security boundary, and nothing downstream may treat it as one.
 */

/** Present on every on-platform request; absent on a local dev box. */
const GEO_HEADER = 'x-vercel-ip-country'

/** Stands in for real geolocation outside production. Ignored in production. */
const DEBUG_HEADER = 'x-debug-country'

/**
 * The countries the assistant is offered in.
 *
 * An empty or malformed `CHAT_ALLOWED_COUNTRIES` means *not configured* and
 * falls back to the default — locking every visitor out is not a sane reading
 * of a typo. `XX` is rejected because that is what the platform sends when it
 * cannot place an address: a non-answer, not a country.
 */
export function allowedCountries(): string[] {
  const parsed = (process.env.CHAT_ALLOWED_COUNTRIES ?? '')
    .split(',')
    .map((code) => code.trim().toUpperCase())
    .filter((code) => /^[A-Z]{2}$/.test(code) && code !== 'XX')

  return parsed.length ? parsed : [...DEFAULT_ALLOWED_COUNTRIES]
}

/**
 * Is the restriction being enforced?
 *
 * Keyed on `VERCEL_ENV`, **not `NODE_ENV`** — and that difference is the whole
 * point. Preview deployments build with `NODE_ENV=production`, so a NODE_ENV
 * check would enforce on preview URLs too and lock you out of the environment
 * you test in. `VERCEL_ENV` tells production apart from preview.
 *
 * `CHAT_REGION_LOCK` overrides both ways, so the restriction can be reproduced
 * locally or lifted in production without shipping code.
 */
export function isRegionLocked(): boolean {
  const override = process.env.CHAT_REGION_LOCK?.trim().toLowerCase()
  if (override === 'on' || override === 'true' || override === '1') return true
  if (override === 'off' || override === 'false' || override === '0') return false

  return process.env.VERCEL_ENV === 'production'
}

/**
 * The visitor's country, or null.
 *
 * Outside production an `X-Debug-Country` header stands in, because there is no
 * real geolocation on a dev box and the refusal path has to be testable.
 * Production reads the platform header and nothing else — honouring a
 * client-supplied country there would make the restriction a suggestion.
 */
export function countryOf(request: Request): string | null {
  const platform = request.headers.get(GEO_HEADER)?.trim().toUpperCase()
  if (platform && /^[A-Z]{2}$/.test(platform) && platform !== 'XX') return platform

  if (process.env.VERCEL_ENV !== 'production') {
    const debug = request.headers.get(DEBUG_HEADER)?.trim().toUpperCase()
    if (debug && /^[A-Z]{2}$/.test(debug)) return debug
  }

  return null
}

export type ChatRegion = {
  allowed: boolean
  /** Returned so a refusal can be explained rather than guessed at. */
  country: string | null
  locked: boolean
}

/**
 * An **unknown** country is refused while the lock is on.
 *
 * "US and Canada only" means denying what cannot be placed; admitting unknowns
 * would make the restriction avoidable by anything that strips the header. The
 * cost of being wrong is bounded and visible: if the platform ever stopped
 * sending the header the assistant would be off for everyone — the kind of
 * failure you hear about immediately, rather than quietly open to the world.
 */
export function chatRegion(request: Request): ChatRegion {
  const locked = isRegionLocked()
  const country = countryOf(request)

  if (!locked) return { allowed: true, country, locked }

  return {
    allowed: country !== null && allowedCountries().includes(country),
    country,
    locked,
  }
}
