// AI shopping assistant — shared constants.
//
// The assistant itself lives on the Django backend; this app is a proxy and a
// UI. See docs/reference/AI_CHAT_IMPLEMENTATION.md for the contract.

/** Matches the server-side cap and the textarea's maxLength — they must agree. */
export const MAX_MESSAGE_CHARS = 2000

/** A reply recommends a handful of products; this bounds a crafted request. */
export const MAX_PRODUCT_HANDLES = 8

/** A single handle longer than this is not a real slug. */
export const MAX_HANDLE_CHARS = 200

/**
 * Cut the backend off before the platform does, so a hung assistant surfaces as
 * a typed error we can word, rather than an opaque gateway timeout.
 */
export const BACKEND_TIMEOUT_MS = 45_000

/** Countries the assistant is offered in when nothing is configured. */
export const DEFAULT_ALLOWED_COUNTRIES = ['US', 'CA'] as const

/** One wording, used by the API and the widget alike. */
export const REGION_MESSAGE = 'The AI assistant is only available in the US and Canada.'

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
