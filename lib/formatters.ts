/**
 * Display formatters — the `lib/formatters.ts` slot described in AGENTS.md
 * ("Currency, date, number formatters").
 */

/**
 * A price with thousands separators and always two decimal places.
 *
 *   1000     -> '1,000.00'
 *   2323     -> '2,323.00'
 *   1020.30  -> '1,020.30'
 *   232.14   -> '232.14'
 *
 * No currency symbol — {@link formatMoney} adds that, and is what display code
 * should reach for. This stays bare for the cases that genuinely want a figure
 * on its own: a spec table, a hidden form value, a label that already says USD.
 *
 * Cents are no longer conditional. They used to be dropped on a whole amount
 * (`1,000`) and kept otherwise (`1,020.30`), which meant a single price column
 * could mix the two and read as though the round numbers had been rounded.
 * Prices are money and money has cents.
 */
export function formatPrice(value: number | string | null | undefined): string {
  const amount = toNumber(value)
  if (amount === null) return ''

  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * A price ready to show to someone: `$1,300.00`.
 *
 * The one formatter display code should use. Before this existed the repo had
 * six different spellings of "show a price" — bare `toLocaleString()`,
 * `toFixed(2)`, three separate local `fmt` helpers using `style: 'currency'`,
 * and raw interpolation of whatever the catalogue sent — so the same container
 * could appear as `$1,300`, `$1,300.00` and `$1300` on three different screens.
 *
 * Unparseable input returns an empty string rather than `$NaN`, matching
 * {@link formatPrice}. Callers that need to say something in that case (`Call
 * for pricing`) should test the value, not the formatted output.
 */
export function formatMoney(value: number | string | null | undefined): string {
  const formatted = formatPrice(value)
  return formatted ? `$${formatted}` : ''
}

/**
 * Parse whatever the catalogue hands us into a number.
 *
 * Prices arrive as numbers from `sale_price` but as strings from raw
 * Elasticsearch variants — `"1,020.30"`, sometimes with a currency symbol — so
 * separators and symbols are stripped before parsing rather than being allowed
 * to turn the value into NaN.
 */
export function toNumber(value: number | string | null | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null

  const cleaned = value.replace(/[^0-9.-]/g, '')
  if (!cleaned || cleaned === '-' || cleaned === '.') return null

  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}
