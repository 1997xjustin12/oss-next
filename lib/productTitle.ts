/**
 * Builds `desc_title` — a human-readable descriptor assembled from a
 * container's specs, e.g.
 *
 *   Used WWT 20ft Shipping Container for Sale
 *   New IICL 40ft High Cube Shipping Container for Rent-To-Own
 *
 * Pattern: `[condition] [grade abbr] [size]ft [High Cube] Shipping Container
 * for [payment type]`.
 *
 * The specs live in `custom_fields`, an array of `{name, value}` pairs, and
 * their raw values are messier than they look — see the notes on each helper.
 * Everything here degrades to omitting a part rather than emitting a
 * placeholder, so a document missing a field produces a shorter title rather
 * than "undefined".
 */

/**
 * The short form of a grade.
 *
 * Real values are `Wind and Water tight (WWT)`, `IICL`, `Cargo Worthy (CW)` and
 * `AS IS` — so the abbreviation is in brackets when there is one, and the whole
 * value already is the abbreviation when there isn't.
 *
 * Reading the bracket also sidesteps a casing inconsistency in the index:
 * `Wind and Water tight (WWT)` and `Wind and Water Tight (WWT)` both exist, and
 * both yield `WWT`.
 */
export function gradeAbbreviation(grade: string | undefined): string {
  const value = grade?.trim()
  if (!value) return ''

  return value.match(/\(([^)]+)\)/)?.[1]?.trim() || value
}

/**
 * The bare length in feet, e.g. `20` from `20'`.
 *
 * Taking the digits rather than trimming the string means `20 ft`, `20'` and
 * `20` all work if the stored format ever shifts. Returns `''` for values with
 * no number in them — `Other` is a real entry in the index.
 */
export function sizeFeet(lengthWidth: string | undefined): string {
  return lengthWidth?.match(/\d+/)?.[0] ?? ''
}

/** `20'` → `20ft`. */
export function sizeLabel(lengthWidth: string | undefined): string {
  const feet = sizeFeet(lengthWidth)
  return feet ? `${feet}ft` : ''
}

/**
 * The interior height in the canonical `8'6"` / `9'6"` form.
 *
 * Rebuilt rather than echoed. The stored strings are `8' 6" Standard` and
 * `9’ 6” High Cube (HC)` — different spacing, and the high-cube one uses curly
 * quotes — so passing either through would produce inconsistent output.
 *
 * Returns `''` for anything that is neither, including an absent height (3
 * documents in the index have none). Defaulting to standard would state a
 * measurement we do not actually know, on a spec line a customer may order
 * from.
 */
export function heightLabel(height: string | undefined): string {
  const value = height?.trim()
  if (!value) return ''

  if (isHighCube(value)) return '9\'6"'
  if (/standard/i.test(value)) return '8\'6"'
  return ''
}

/**
 * Is this a high cube?
 *
 * **Matched on the words, never on the measurement.** The index stores
 * `8' 6" Standard` with straight quotes but `9’ 6” High Cube (HC)` with curly
 * ones (U+2019 and U+201D). Testing for `9' 6"` looks correct and silently
 * matches nothing.
 */
export function isHighCube(height: string | undefined): boolean {
  return /high\s*cube/i.test(height ?? '')
}

/**
 * `buy` → `Sale`, `rental` → `Rent`, `rto` → `Rent-To-Own`.
 *
 * Note this is `payment_type`, not `payment_term`: the term is the contract
 * length (`['24']`), while the type is what the examples in the spec actually
 * show.
 */
export function paymentLabel(paymentType: string | undefined): string {
  switch (paymentType?.trim().toLowerCase()) {
    case 'buy':
    case 'purchase':
      return 'Sale'
    case 'rental':
      return 'Rent'
    case 'rto':
      return 'Rent-To-Own'
    default:
      return ''
  }
}

/**
 * The city part of a stored location.
 *
 * Locations are stored as `City, ST` — `Atlanta, GA`, `Gaithersburg, MD` — and
 * the loc_title reads better without the state, matching the spec's example
 * ("Best Deals on Los Angeles Shipping Containers For Sale").
 *
 * Two values in the index don't fit that shape and are handled here:
 *
 *   - `Salt Lake City` carries no state at all, and passes through unchanged.
 *   - `Various North America` is the generic placeholder used by display-only
 *     listings with no real depot behind them. It is dropped, because "Best
 *     Deals on Various North America Shipping Containers" is not a sentence.
 */
export function cityOf(location: string | undefined): string {
  const value = location?.trim()
  if (!value || value === GENERIC_LOCATION) return ''

  return value.split(',')[0].trim()
}

/** Matches DEFAULT_LOCATION in lib/constants.ts. Inlined to keep this module
 *  dependency-free — see the note at the foot of the file. */
const GENERIC_LOCATION = 'Various North America'

export type DescTitleParts = {
  /** `New` or `Used`, as stored. */
  condition?: string
  /** The full grade string; abbreviated here. */
  grade?: string
  /** `length_width`, e.g. `20'`. */
  size?: string
  /** The full height string; only "high cube" is read from it. */
  height?: string
  /** `buy`, `rental` or `rto`. */
  paymentType?: string
}

/**
 * Assemble the descriptor from loose parts.
 *
 * Every part is optional and an absent one is dropped, so this never emits a
 * double space or a dangling "for".
 */
export function formatDescTitle(parts: DescTitleParts): string {
  const head = [
    parts.condition?.trim(),
    gradeAbbreviation(parts.grade),
    sizeLabel(parts.size),
    isHighCube(parts.height) ? 'High Cube' : '',
    'Shipping Container',
  ]
    .filter(Boolean)
    .join(' ')

  const payment = paymentLabel(parts.paymentType)
  return payment ? `${head} for ${payment}` : head
}

/**
 * Every container in the catalogue is 8 feet wide, whatever its length — that
 * is fixed by the ISO standard, not by our data, so it is a constant here
 * rather than a field read.
 */
const CONTAINER_WIDTH = "8'"

export type SizeTitleParts = {
  /** `length_width`, e.g. `20'`. */
  size?: string
  /** The full height string; classified, not echoed. */
  height?: string
}

/**
 * `20' L x 8' W x 8'6" H`
 *
 * Returns `''` unless both the length and the height are known — a partial
 * dimension line is worse than none, because it reads as complete.
 */
export function formatSizeTitle(parts: SizeTitleParts): string {
  const feet = sizeFeet(parts.size)
  const height = heightLabel(parts.height)
  if (!feet || !height) return ''

  return `${feet}' L x ${CONTAINER_WIDTH} W x ${height} H`
}

export type LocTitleParts = {
  /** The stored location, e.g. `Atlanta, GA`. Only the city is used. */
  location?: string
  /** `buy`, `rental` or `rto`. */
  paymentType?: string
}

/**
 * `Best Deals on Los Angeles Shipping Containers For Sale`
 *
 * Returns `''` when there is no real location — a generic listing or a missing
 * field — rather than emitting "Best Deals on Shipping Containers", which reads
 * like a bug and would be duplicated across every such product.
 */
export function formatLocTitle(parts: LocTitleParts): string {
  const city = cityOf(parts.location)
  if (!city) return ''

  const payment = paymentLabel(parts.paymentType)
  const head = `Best Deals on ${city} Shipping Containers`

  return payment ? `${head} For ${payment}` : head
}

// Deliberately no hit-based wrapper here. Reading custom_fields needs helpers
// from lib/pricing.ts, which imports this module — so the extraction lives
// there, in formatProduct(), and every hit arrives with `desc_title` already
// populated. Callers read `hit.desc_title` rather than recomputing it, which is
// also what stops two call sites disagreeing about the same container.
