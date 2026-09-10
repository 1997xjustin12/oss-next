// AI shopping assistant — shared constants.
//
// The assistant itself lives on the Django backend; this app is a proxy and a
// UI. See docs/reference/AI_CHAT_IMPLEMENTATION.md for the contract.

/** Matches the server-side cap and the textarea's maxLength — they must agree. */
export const MAX_MESSAGE_CHARS = 2000

/** A reply recommends a handful of products; this bounds a crafted request. */
export const MAX_PRODUCT_HANDLES = 8

/**
 * Upper bound on handles resolved when a whole conversation is restored.
 *
 * A restored thread can mention far more products than one reply does. The
 * lookups are chunked into MAX_PRODUCT_HANDLES-sized requests, so this caps how
 * many round trips a restore can cost. Handles are collected newest-reply-first,
 * so if the budget runs out it is the oldest answers that lose their cards.
 */
export const MAX_RESOLVED_HANDLES = 32

/** A single handle longer than this is not a real slug. */
export const MAX_HANDLE_CHARS = 200

/**
 * Cut the backend off before the platform does, so a hung assistant surfaces as
 * a typed error we can word, rather than an opaque gateway timeout.
 */
export const BACKEND_TIMEOUT_MS = 45_000

/**
 * The two country sets the admin switch chooses between.
 *
 * `STRICT` is the sales markets — the catalogue only ships to the US and
 * Canada, and every message costs a backend model call, so this is what points
 * that spend at the customers we can actually serve.
 *
 * `RELAXED` adds the Philippines, where the team works. It exists so the
 * assistant can be exercised against production without a VPN. It is a wider
 * spend, not a wider market: nothing about the catalogue changes.
 *
 * Deliberately two fixed sets rather than a free-text country list. A text
 * field invites `US,CANADA` or `us, ca ,` and fails in ways nobody notices
 * until the assistant is off for a whole country.
 */
export const CHAT_COUNTRIES_STRICT = ['US', 'CA'] as const
export const CHAT_COUNTRIES_RELAXED = ['US', 'CA', 'PH'] as const

/** Countries the assistant is offered in when the switch cannot be read. */
export const DEFAULT_ALLOWED_COUNTRIES = CHAT_COUNTRIES_STRICT

/** For prose: `['US','CA']` -> `the US and Canada`. */
const COUNTRY_NAMES: Record<string, string> = {
  US: 'the US',
  CA: 'Canada',
  PH: 'the Philippines',
}

/**
 * The refusal wording, built from whichever set is live.
 *
 * Derived rather than a constant because the set is now a runtime switch: a
 * fixed "US and Canada" string would start lying to refused visitors the moment
 * someone turned the Philippines on.
 */
export function regionMessage(countries: readonly string[]): string {
  const names = countries.map((code) => COUNTRY_NAMES[code] ?? code)
  const list =
    names.length <= 1
      ? (names[0] ?? 'selected regions')
      : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`

  return `The AI assistant is only available in ${list}.`
}

export const GREETING =
  "Hi! Ask me anything about the containers here — what fits your space, what's in your budget, or how two models compare."

export const DISCLAIMER = 'AI can make mistakes — check important details before ordering.'

// ── Conversation history (browser-side) ─────────────────────────────────────

/**
 * Measured from the **last** message, not the first: a thread someone is
 * actively using should not vanish mid-way because it started eight days ago.
 */
export const HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000

/** Bumped when the record shape changes. Anything older is dropped, not migrated. */
export const HISTORY_VERSION = 1

/** Well past a real session, far short of the ~5MB the cart also draws on. */
export const MAX_HISTORY_MESSAGES = 60

/** Session-storage key for the cached availability answer. */
export const AVAILABILITY_KEY = 'oss:chat-available'

// ── Server-side history ─────────────────────────────────────────────────────

/**
 * How many past conversations to ask the backend for.
 *
 * The widget resumes the most recent one; the rest are fetched only so the
 * "most recent" choice is made against real data rather than whatever the
 * backend happened to return first.
 */
export const HISTORY_FETCH_LIMIT = 10
