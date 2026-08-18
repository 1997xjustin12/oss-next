import { HISTORY_TTL_MS, HISTORY_VERSION, MAX_HISTORY_MESSAGES } from '@/config/chat'

/**
 * Conversation persistence, in the visitor's own browser.
 *
 * There is no server-side transcript. Guests will never have one, so their
 * thread lives here for seven days.
 *
 * **Everything in here is defensive.** `localStorage` *throws* rather than
 * returning null in Safari's private mode and inside sandboxed iframes, and a
 * stored value can be corrupt or left over from an older build. History is a
 * convenience — nothing in it may throw into the widget.
 */

export type StoredMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  handles?: string[]
}

type HistoryRecord = {
  v: number
  savedAt: number
  sessionId?: string
  messages: StoredMessage[]
}

/**
 * `null` means guest. `undefined` is a different state — "auth has not settled
 * yet" — and callers must not treat it as guest. See the widget's identity
 * effect for why that distinction matters.
 */
export type ChatIdentity = string | null

const PREFIX = 'oss:chat-history'

function brand(): string {
  // In development every storefront is served from localhost and therefore
  // shares one localStorage origin. In production each brand has its own
  // domain and is already isolated, but keying on it costs nothing and stops a
  // developer switching brands from inheriting the previous conversation.
  return (process.env.NEXT_PUBLIC_STORE_DOMAIN || 'local').toLowerCase()
}

/**
 * The identity segment is the user **id**, never the email — an email would put
 * a personal identifier into a storage key readable by every script on the
 * page, for no benefit.
 */
export function historyKey(identity: ChatIdentity): string {
  return identity ? `${PREFIX}:${brand()}:u:${identity}` : `${PREFIX}:${brand()}:guest`
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Nothing to do — a key we cannot delete is not worth failing over.
  }
}

function ourKeys(): string[] {
  try {
    return Object.keys(window.localStorage).filter((key) => key.startsWith(`${PREFIX}:${brand()}:`))
  } catch {
    return []
  }
}

function isFresh(record: HistoryRecord): boolean {
  // Measured from the last save, which happens when a message is added — so the
  // clock runs from the last thing someone *asked*, not from when they first
  // opened the site.
  return Date.now() - record.savedAt < HISTORY_TTL_MS
}

function parse(raw: string | null): HistoryRecord | null {
  if (!raw) return null

  try {
    const data = JSON.parse(raw) as unknown
    if (!data || typeof data !== 'object') return null

    const record = data as HistoryRecord
    if (record.v !== HISTORY_VERSION) return null
    if (typeof record.savedAt !== 'number') return null
    if (!Array.isArray(record.messages)) return null

    const messages = record.messages.filter(
      (m): m is StoredMessage =>
        !!m &&
        typeof m === 'object' &&
        typeof (m as StoredMessage).id === 'string' &&
        typeof (m as StoredMessage).text === 'string' &&
        ((m as StoredMessage).role === 'user' || (m as StoredMessage).role === 'assistant'),
    )

    return { ...record, messages }
  } catch {
    return null
  }
}

/**
 * Load a thread, deleting it on the way past if it is expired, corrupt or from
 * an older version. Cleaning up here rather than later means a bad record is
 * not re-read on every page view.
 */
export function loadHistory(identity: ChatIdentity): HistoryRecord | null {
  const key = historyKey(identity)
  const record = parse(read(key))

  if (!record) {
    if (read(key) !== null) remove(key)
    return null
  }

  if (!isFresh(record)) {
    remove(key)
    return null
  }

  return record
}

/**
 * Save a thread, shedding the oldest messages if the origin is out of quota.
 *
 * The retry is a **loop**, not a single attempt: quota is shared with the cart,
 * so a failure means the origin is already close to full and halving once may
 * not be enough. Losing the start of a long conversation beats losing all of
 * it, and beats throwing.
 */
export function saveHistory(
  identity: ChatIdentity,
  { messages, sessionId }: { messages: StoredMessage[]; sessionId?: string },
): void {
  const key = historyKey(identity)
  let trimmed = messages.slice(-MAX_HISTORY_MESSAGES)

  while (trimmed.length > 0) {
    const record: HistoryRecord = {
      v: HISTORY_VERSION,
      savedAt: Date.now(),
      ...(sessionId ? { sessionId } : {}),
      messages: trimmed,
    }

    if (write(key, JSON.stringify(record))) return
    trimmed = trimmed.slice(Math.ceil(trimmed.length / 2))
  }
}

export function clearHistory(identity: ChatIdentity): void {
  remove(historyKey(identity))
}

/**
 * Remove every signed-in conversation for this brand, leaving guest history
 * alone.
 *
 * Runs whenever the page loads signed-out. The logout path clears the account's
 * copy directly, but only when the widget happened to be mounted — a full
 * navigation to the logout route, a tab closed mid-session, or a logout in
 * another tab all miss it. Signed out has to mean gone however it happened.
 */
export function clearAccountHistories(): void {
  const guest = historyKey(null)
  for (const key of ourKeys()) {
    if (key !== guest) remove(key)
  }
}

/**
 * Sweep expired threads across *every* identity this app owns, not just the
 * current one — otherwise someone who signs in once and never returns leaves
 * their conversation in the browser indefinitely, which is the case the
 * seven-day limit most exists to cover.
 */
export function pruneExpiredHistory(): void {
  for (const key of ourKeys()) {
    const record = parse(read(key))
    if (!record || !isFresh(record)) remove(key)
  }
}
