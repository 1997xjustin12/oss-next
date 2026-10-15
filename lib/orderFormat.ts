import { formatMoney } from '@/lib/formatters'

/**
 * UTC, because `estimated_delivery` arrives as a bare date ("2026-10-17"),
 * which parses as UTC midnight. Formatting it in a US time zone would show the
 * day before.
 */
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })

export function formatOrderDate(iso: string | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : DATE_FORMAT.format(date)
}

/** Order money arrives as strings; an unparseable value shows an em dash, not `$NaN`. */
export function formatOrderMoney(value: string | number | undefined): string {
  return formatMoney(value) || '—'
}

/**
 * Only https URLs become links. These come from the backend, but a link is
 * the one place a bad value turns into script (`javascript:`), so the check
 * costs nothing and closes that for good.
 */
export function safeHttpsUrl(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).protocol === 'https:' ? url : null
  } catch {
    return null
  }
}
