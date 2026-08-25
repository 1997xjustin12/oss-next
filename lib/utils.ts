/**
 * General-purpose helpers — the `lib/utils.ts` slot described in AGENTS.md.
 *
 * Keep this for small, pure, domain-agnostic functions. Anything that knows
 * about products, carts, SEO or the backend belongs in its own module.
 */

/**
 * Word = a run of letters. Hyphens, slashes, brackets, digits and quotes are
 * separators, so `rent-to-own` becomes `Rent-To-Own` and `(cargo worthy)`
 * becomes `(Cargo Worthy)` rather than being skipped for not starting with a
 * letter.
 *
 * Apostrophes stay *inside* a word, so `o'brien` becomes `O'brien` rather than
 * `O'Brien` — the latter is right for Irish surnames and wrong for `don't`, and
 * this catalogue has neither.
 */
const WORD = /\p{L}[\p{L}\p{M}'’]*/gu

/**
 * A letter run only starts a word if a digit isn't glued to its front.
 *
 * Without this, `40ft high cube` becomes `40Ft High Cube` — the run `ft` looks
 * like a fresh word because the digits before it aren't letters. Sizes like
 * 40ft, 20ft and 10ft run through every product title on this site, so that is
 * the common case, not an edge one.
 *
 * A plain lookbehind would express this more neatly, but Safari only gained
 * them in 16.4 and a mangled product title is a poor trade for brevity.
 */
function startsWord(source: string, offset: number): boolean {
  if (offset === 0) return true
  return !/[\p{L}\p{N}]/u.test(source[offset - 1])
}

type CapitalizeOptions = {
  /**
   * Lowercase the rest of each word before capitalising it.
   *
   * **Off by default, and think before turning it on.** This catalogue is full
   * of acronyms — IICL, WWT, CW, HC, AS IS — and normalising turns `IICL` into
   * `Iicl`. Only use it on input you know is uniformly lowercase or SHOUTED,
   * such as a raw user-typed string.
   */
  normalize?: boolean
}

/**
 * Capitalise the first letter of every word.
 *
 * By default the rest of each word is left exactly as it was, which is what
 * makes this safe on product attributes: `Wind and Water tight (WWT)` keeps its
 * acronym, and `cargo worthy` still becomes `Cargo Worthy`.
 *
 * ```ts
 * capitalizeWords('cargo worthy')            // 'Cargo Worthy'
 * capitalizeWords('IICL')                    // 'IICL'      — untouched
 * capitalizeWords('9\' 6" high cube (hc)')   // '9\' 6" High Cube (Hc)'
 * capitalizeWords('rent-to-own')             // 'Rent-To-Own'
 * capitalizeWords('CARGO WORTHY', { normalize: true })  // 'Cargo Worthy'
 * ```
 */
export function capitalizeWords(value: string | null | undefined, options: CapitalizeOptions = {}): string {
  if (!value) return ''

  return value.replace(WORD, (word, offset: number) => {
    if (!startsWord(value, offset)) return word

    const rest = options.normalize ? word.slice(1).toLowerCase() : word.slice(1)
    return word[0].toUpperCase() + rest
  })
}

/**
 * Capitalise only the first letter of the whole string, leaving the rest alone.
 *
 * For sentences and single labels, where capitalising every word would read as
 * a heading rather than as prose.
 */
export function capitalizeFirst(value: string | null | undefined): string {
  if (!value) return ''

  let done = false
  return value.replace(WORD, (word, offset: number) => {
    // Same word-start rule, so `40ft container` is left alone rather than
    // becoming `40Ft container`.
    if (done || !startsWord(value, offset)) return word

    done = true
    return word[0].toUpperCase() + word.slice(1)
  })
}
