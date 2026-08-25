/**
 * Display formatters — the `lib/formatters.ts` slot described in AGENTS.md
 * ("Currency, date, number formatters").
 */

/**
 * A price with thousands separators and cents only when there are cents.
 *
 *   1000     -> '1,000'
 *   2323.00  -> '2,323'
 *   1020.30  -> '1,020.30'
 *   232.14   -> '232.14'
 *
 * No currency symbol: callers add `$` where they need it, so this stays usable
 * for a bare figure in a spec table or a label that already says "USD".
 *
 * The all-or-nothing decimal rule is the point. `maximumFractionDigits: 2` with
 * `minimumFractionDigits: 0` — the obvious spelling, and what two call sites in
 * this repo currently do — renders 1020.30 as `1,020.3`, which reads as a
 * truncated number rather than a price.
 */
export function formatPrice(value: number | string | null | undefined): string {
  const amount = toNumber(value)
  if (amount === null) return ''

  // Compared in whole cents rather than with `% 1`, because binary floats make
  // the remainder of a value like 1020.30 a long approximation rather than a
  // clean 0.3, and a value like 1000.0000001 would otherwise grow decimals.
  const hasCents = Math.round(amount * 100) % 100 !== 0

  return amount.toLocaleString('en-US', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  })
}

/**
 * Parse whatever the catalogue hands us into a number.
 *
 * Prices arrive as numbers from `sale_price` but as strings from raw
 * Elasticsearch variants — `"1,020.30"`, sometimes with a currency symbol — so
 * separators and symbols are stripped before parsing rather than being allowed
 * to turn the value into NaN.
 */
function toNumber(value: number | string | null | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null

  const cleaned = value.replace(/[^0-9.-]/g, '')
  if (!cleaned || cleaned === '-' || cleaned === '.') return null

  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}
