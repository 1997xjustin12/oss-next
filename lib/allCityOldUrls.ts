import { isNativePath } from '@/config/routes'
import type { AllCityOldUrl } from '@/types/allCity'

/**
 * The rules for the old-URL redirects (Admin → All City Pages → Old URL
 * redirects): an old path on this site that answers a 301 to an /all-city/
 * page. Pure: the editor, the Server Actions and the proxy all use it.
 */

/** More rows than this is not a list someone keeps by hand; it also bounds the proxy's map. */
export const ALL_CITY_OLD_URLS_MAX = 2000

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
/** A path segment as WordPress wrote them: lower-case letters, digits, hyphens and underscores. */
const PATH = /^(?:\/[a-z0-9][a-z0-9_-]*)+$/

/**
 * An old URL as typed or pasted ("https://old.onsitestorage.com/storage-kennesaw/",
 * "storage-kennesaw", "/Storage-Kennesaw?x=1") as the path the proxy compares:
 * "/storage-kennesaw". The host is dropped, so a link copied from the old site
 * works. Null when it is not a path this list can hold.
 */
export function normalizeOldUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null
  let path = input.trim()
  if (!path) return null
  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname
    } catch {
      return null
    }
  }
  path = `/${path.replace(/[?#].*$/, '').replace(/^\/+|\/+$/g, '')}`.toLowerCase()
  return PATH.test(path) ? path : null
}

/** The /all-city/ page a row goes to, as typed ("/all-city/storage-kennesaw", a full URL, or the slug). */
export function normalizeAllCityTarget(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const path = normalizeOldUrl(input)
  const slug = path?.startsWith('/all-city/') ? path.slice('/all-city/'.length) : path?.slice(1)
  return slug && SLUG.test(slug) ? slug : null
}

/**
 * Why an old path cannot be redirected, or null when it can. Native routes
 * (/all-city/ itself, the location and product pages, the admin, the API) are
 * refused: the proxy would send them away before their own route answered.
 */
export function oldUrlProblem(from: string): string | null {
  if (from === '/all-city' || from.startsWith('/all-city/')) return 'is already an /all-city/ page'
  if (isNativePath(from)) return 'is one of this site’s own pages (only old WordPress URLs can redirect)'
  return null
}

export type OldUrlRowInput = { from: unknown; to: unknown }

/**
 * A list as the editor sent it, checked row by row: the clean rows, and every
 * problem by row number (1-based, as the editor shows them). Blank rows are
 * dropped. It does not check that the target page exists (that needs the
 * records): the Server Action does.
 */
export function checkAllCityOldUrls(input: readonly OldUrlRowInput[]): { rows: AllCityOldUrl[]; errors: string[] } {
  const rows: AllCityOldUrl[] = []
  const errors: string[] = []
  const seen = new Map<string, number>()
  input.forEach((row, i) => {
    const n = i + 1
    const blank = (v: unknown) => typeof v !== 'string' || !v.trim()
    if (blank(row.from) && blank(row.to)) return
    const from = normalizeOldUrl(row.from)
    const to = normalizeAllCityTarget(row.to)
    if (!from) return void errors.push(`Row ${n}: the old URL is not a path on this site.`)
    const problem = oldUrlProblem(from)
    if (problem) return void errors.push(`Row ${n}: ${from} ${problem}.`)
    if (!to) return void errors.push(`Row ${n}: the new URL must be an /all-city/ page.`)
    const first = seen.get(from)
    if (first) return void errors.push(`Row ${n}: ${from} is already on row ${first}.`)
    seen.set(from, n)
    rows.push({ from, to })
  })
  if (rows.length > ALL_CITY_OLD_URLS_MAX) errors.push(`At most ${ALL_CITY_OLD_URLS_MAX} redirects.`)
  return { rows, errors }
}

/**
 * A stored list, read back (Redis, the default): the rows that still pass,
 * the rest dropped. Not an array (a corrupt record) gives null, so the caller
 * keeps its fallback.
 */
export function conformAllCityOldUrls(raw: unknown): AllCityOldUrl[] | null {
  if (!Array.isArray(raw)) return null
  const rows = raw.filter((row): row is OldUrlRowInput => !!row && typeof row === 'object')
  return checkAllCityOldUrls(rows).rows.slice(0, ALL_CITY_OLD_URLS_MAX)
}
