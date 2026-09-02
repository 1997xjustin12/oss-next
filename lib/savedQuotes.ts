import type { GuestLead } from '@/lib/guestCapture'

/**
 * Quotes the visitor has saved, newest first.
 *
 * Kept in this browser only. There is no server-side store for these yet —
 * `deliverQuoteRequest()` is still a stub — so a saved quote survives a reload
 * and nothing more. Clearing site data loses them, and they do not follow the
 * visitor to another device.
 *
 * Each entry is a snapshot, not a live reference: the price, delivery and
 * distance are copied at the moment of saving. That is the point of saving one
 * — a quote that silently re-priced itself would not be a quote.
 */

const KEY = 'oss-saved-quotes'

/**
 * Enough to be useful, small enough to stay well inside the ~5MB localStorage
 * budget shared with the cart and auth session. The oldest fall off the end.
 */
const MAX_QUOTES = 50

/** One row of a saved quote — mirrors what the modal showed at the time. */
export type SavedQuoteLine = {
  label: string
  value: string
}

export type SavedQuote = {
  id: string
  /** ISO timestamp. Sort key, and shown as "Saved 2 Sep". */
  savedAt: string
  productTitle: string
  /** Product handle, so the entry can link back to the page it came from. */
  handle: string
  lines: SavedQuoteLine[]
  total: string
  /** e.g. `/mo` — kept separate so the figure and its unit stay distinguishable. */
  totalSuffix?: string
  /** Who saved it, so a follow-up has someone to reach. */
  lead: GuestLead
}

export type NewSavedQuote = Omit<SavedQuote, 'id' | 'savedAt'>

function read(): SavedQuote[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    // Written by an older shape, or hand-edited — drop anything unusable
    // rather than rendering a row with holes in it.
    return parsed.filter(
      (q): q is SavedQuote =>
        !!q && typeof q === 'object' && typeof (q as SavedQuote).id === 'string',
    )
  } catch {
    return []
  }
}

function write(quotes: SavedQuote[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(quotes.slice(0, MAX_QUOTES)))
  } catch {
    // Storage full or unavailable — the quote is still on screen, only the
    // record of it is lost.
  }
}

/** Every saved quote, newest first. */
export function getSavedQuotes(): SavedQuote[] {
  // Sorted on read as well as written in order: an entry restored from a
  // backup, or written by a tab that was open across a change, should still
  // land in the right place.
  return read().sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

/**
 * Push a quote onto the stack and return it.
 *
 * Deliberately allows the same container twice. Two quotes for one product a
 * week apart are two different prices, and collapsing them would throw away
 * the older one — which is the one worth comparing against.
 */
export function saveQuote(quote: NewSavedQuote): SavedQuote {
  const entry: SavedQuote = {
    ...quote,
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
  }
  write([entry, ...read()])
  return entry
}

export function removeSavedQuote(id: string): void {
  write(read().filter((q) => q.id !== id))
}

export function clearSavedQuotes(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing was stored to begin with.
  }
}
