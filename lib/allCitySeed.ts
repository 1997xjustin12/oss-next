// The attribute is what Node's test runner requires for JSON; the bundler accepts it too.
import SEED from '@/lib/data/allCityPages.json' with { type: 'json' }
import { ALL_CITY_DEPOTS } from '@/lib/data/allCityDepots'
import type { AllCityPage, AllCityState } from '@/types/allCity'

/**
 * The /all-city/ pages as imported from WordPress: lib/data/allCityPages.json,
 * written by scripts/archive-all-city-pages.mjs (posts and tags from the REST
 * API, each page's h1 from the live page). The seed every page falls back to;
 * the admin's edits are laid over it (services/allCity.service.ts).
 *
 * The file is compact because there are 8,541 rows: each row is a tuple, and
 * the SEO title and description are stored as "the heading plus ending N" where
 * they are (most of them). `decodeRow` is the only reader of the raw shape.
 */

/** Row flags (bit field). */
export const ALL_CITY_FLAGS = { popular: 1, viewAll: 2, noindex: 4, depotCity: 8 } as const

/**
 * `[slug, city, h1, title, description, depotKey, flags, keywordHeading?, state?]`
 * - title: a string, or N for `${h1} | ${titleEndings[N]}`
 * - description: a string, or `[lead, N]` for `${lead}. ${descriptionTails[N]}`
 * - state: only where the page's lists follow a state other than its depot's
 */
export type AllCityRow = [
  slug: string,
  city: string,
  h1: string,
  title: string | number,
  description: string | [string, number],
  depotKey: string,
  flags: number,
  keywordHeading?: string | null,
  state?: AllCityState | null,
]

export type AllCitySeed = {
  takenAt: string
  titleEndings: string[]
  descriptionTails: string[]
  rows: AllCityRow[]
}

const DATA = SEED as unknown as AllCitySeed

export const ALL_CITY_SEED_TAKEN_AT = DATA.takenAt

export function decodeRow(row: AllCityRow, tables: Pick<AllCitySeed, 'titleEndings' | 'descriptionTails'> = DATA): AllCityPage {
  const [slug, city, h1, title, description, depotKey, flags, keywordHeading, state] = row
  return {
    slug,
    city,
    // The depot's state unless the row says otherwise (a page tagged to another state's depot).
    state: state ?? ALL_CITY_DEPOTS[depotKey]?.state,
    depotKey,
    variant: flags & ALL_CITY_FLAGS.depotCity ? 'depotCity' : 'city',
    h1,
    ...(keywordHeading ? { keywordHeading } : {}),
    seo: {
      title: typeof title === 'number' ? `${h1} | ${tables.titleEndings[title]}` : title,
      description: Array.isArray(description) ? `${description[0]}. ${tables.descriptionTails[description[1]]}` : description,
      ...(flags & ALL_CITY_FLAGS.noindex ? { noindex: true } : {}),
    },
    lists: { popular: Boolean(flags & ALL_CITY_FLAGS.popular), viewAll: Boolean(flags & ALL_CITY_FLAGS.viewAll) },
  }
}

let bySlug: Map<string, AllCityRow> | null = null

function rowsBySlug(): Map<string, AllCityRow> {
  bySlug ??= new Map(DATA.rows.map((row) => [row[0], row]))
  return bySlug
}

/** One page as imported, or null. A Map read, built once per server instance. */
export function getSeedPage(slug: string): AllCityPage | null {
  const row = rowsBySlug().get(slug)
  return row ? decodeRow(row) : null
}

/** Every imported page. Decodes all 8,541 rows: for list building and scripts, not per request. */
export function allSeedPages(): AllCityPage[] {
  return DATA.rows.map((row) => decodeRow(row))
}

export function seedSlugs(): string[] {
  return DATA.rows.map((row) => row[0])
}
