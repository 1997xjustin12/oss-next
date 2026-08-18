/**
 * The set of WordPress content paths that actually exist, for the proxy.
 *
 * ## Why this exists
 *
 * A missing WordPress path used to return **HTTP 200** with the Not Found page
 * in the body. That is not a bug in the route — it is how streaming works:
 * `notFound()` runs inside the catch-all's Suspense boundary, by which point
 * the response headers are already on the wire and the status can no longer be
 * changed. Next's own docs say so, and recommend exactly this fix:
 *
 *   "If you need a 404 status … ensure the resource exists before the response
 *    body is streamed … You can run this check in proxy … Keep proxy checks
 *    fast, and avoid fetching full content there."
 *
 * Next already injects `<meta name="robots" content="noindex">` into those
 * streamed 404s, so they are not indexed. What they still do is report success
 * to anything reading the status line: link checkers, analytics, and agents
 * that trust a 200 and go on to quote the "Not Found" page as content.
 *
 * ## Safety
 *
 * This can only ever turn a 200 into a 404, so a wrong answer takes a real page
 * off the site. Every uncertainty therefore resolves to "let it through":
 *
 *   - the fetch failed, timed out, or the backend is down  -> allow
 *   - the response was empty or implausibly small          -> allow
 *   - the path simply isn't in a healthy list              -> 404
 *
 * The MIN_PLAUSIBLE_PATHS floor is the important one: a truncated or partially
 * written response would otherwise 404 most of the site at once.
 */

const BACKEND = (process.env.NEXT_OSS_BACKEND_URL ?? '').replace(/\/+$/, '')
const API_KEY = process.env.NEXT_OSS_BACKEND_KEY
const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

/** Same module-scope TTL pattern as lib/maintenance.ts — at most one fetch per
 *  TTL per proxy instance, never one per request. */
const TTL_MS = 10 * 60 * 1000

/**
 * Below this, treat the list as untrustworthy rather than authoritative. The
 * real list is ~1,700 entries; anything near zero means a partial response, and
 * acting on it would 404 the entire content site.
 */
const MIN_PLAUSIBLE_PATHS = 200

type PathCache = { paths: Set<string>; at: number }
let cache: PathCache | null = null
let inflight: Promise<PathCache | null> | null = null

function normalise(path: string): string {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, '')
  return clean.startsWith('/') ? clean.toLowerCase() : `/${clean.toLowerCase()}`
}

async function loadPaths(): Promise<PathCache | null> {
  if (!BACKEND || !API_KEY) return null

  try {
    const res = await fetch(`${BACKEND}/api/sitemap/?type=page`, {
      headers: {
        Authorization: `Api-Key ${API_KEY}`,
        'X-Store-Domain': STORE_DOMAIN ?? '',
      },
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) return null

    const data = (await res.json()) as { pages?: { path?: string }[] }
    const rows = Array.isArray(data.pages) ? data.pages : []
    const paths = new Set(
      rows.map((r) => normalise(r.path ?? '')).filter((p) => p.length > 1),
    )

    if (paths.size < MIN_PLAUSIBLE_PATHS) {
      console.warn(`[wpPaths] only ${paths.size} paths returned — treating list as unhealthy`)
      return null
    }

    return { paths, at: Date.now() }
  } catch {
    return null
  }
}

/**
 * `false` only when the list is healthy AND the path is definitively absent.
 * `true` covers both "it exists" and "we don't know", because the caller turns
 * `false` into a 404.
 */
export async function wpPathMayExist(path: string): Promise<boolean> {
  const now = Date.now()

  if (!cache || now - cache.at > TTL_MS) {
    // Collapse concurrent refreshes so a cold instance under load makes one
    // request, not one per in-flight requestexit.
    inflight ??= loadPaths().finally(() => {
      inflight = null
    })
    const fresh = await inflight
    if (fresh) cache = fresh
  }

  // No healthy list, ever: allow everything. The route still renders its own
  // noindex'd Not Found page, so this degrades to today's behaviour rather
  // than to a broken site.
  if (!cache) return true

  return cache.paths.has(normalise(path))
}
