/**
 * The set of blog slugs that actually exist, for the proxy.
 *
 * Same problem and same shape as lib/wpPaths.ts: `notFound()` in the article
 * route runs inside a Suspense boundary, by which point the status line is
 * already on the wire, so a missing slug answers **200** with the Not Found
 * page in the body. Resolving the post above the boundary instead is not an
 * option here — cacheComponents rejects a route that blocks its whole shell on
 * a per-request fetch. So the check moves in front of the render, exactly as
 * Next's own docs recommend.
 *
 * ## Safety
 *
 * This can only ever turn a 200 into a 404, so a wrong answer takes a real
 * article off the site. Every uncertainty resolves to "let it through":
 *
 *   - the fetch failed, timed out, or the backend is down   -> allow
 *   - there are more posts than we are willing to enumerate -> allow
 *   - the list is healthy and the slug is not in it         -> 404
 *
 * A healthy response reporting zero posts IS authoritative — that is the honest
 * state of a blog with nothing published yet, and every article URL should 404.
 * This is the one place where it differs from wpPaths.ts, which treats a tiny
 * list as evidence of a truncated response.
 */

import { MAX_PAGE_SIZE } from '@/config/blog'
import { STORE_KEY } from '@/config/store'

const BACKEND = (process.env.NEXT_OSS_BACKEND_URL ?? '').replace(/\/+$/, '')
const API_KEY = process.env.NEXT_OSS_BACKEND_KEY

/** Same module-scope TTL pattern as lib/wpPaths.ts — at most one refresh per
 *  TTL per proxy instance, never one per request. */
const TTL_MS = 10 * 60 * 1000

/**
 * Stop enumerating past this many posts and fail open instead.
 *
 * The refresh runs once per TTL, not per request, so the page-through is cheap.
 * But an unbounded loop in a proxy is a liability, and a partial set would 404
 * real articles — so past this point the check simply stops applying. Raise it,
 * or move the check into a route segment, if the blog ever grows beyond it.
 */
const MAX_SLUGS = 500

type SlugCache = { slugs: Set<string>; at: number }
let cache: SlugCache | null = null
let inflight: Promise<SlugCache | null> | null = null

async function loadSlugs(): Promise<SlugCache | null> {
  if (!BACKEND || !API_KEY) return null

  const slugs = new Set<string>()

  try {
    for (let page = 1; slugs.size < MAX_SLUGS; page++) {
      const url =
        `${BACKEND}/api/blogs/?store=${encodeURIComponent(STORE_KEY)}` +
        `&page=${page}&page_size=${MAX_PAGE_SIZE}&ordering=-published_at`

      const res = await fetch(url, {
        headers: { Accept: 'application/json', Authorization: `Api-Key ${API_KEY}` },
        signal: AbortSignal.timeout(8_000),
      })
      // A 404 here means "page past the end", which only happens after at least
      // one good page — so the set we have is complete, not broken.
      if (res.status === 404) break
      if (!res.ok) return null

      const data = (await res.json()) as { count?: number; results?: { slug?: string }[] }
      const rows = Array.isArray(data.results) ? data.results : []

      if (page === 1 && typeof data.count === 'number' && data.count > MAX_SLUGS) {
        console.warn(`[blogSlugs] ${data.count} posts exceeds the ${MAX_SLUGS} cap — skipping the 404 check`)
        return null
      }

      for (const row of rows) {
        const slug = row.slug?.trim().toLowerCase()
        if (slug) slugs.add(slug)
      }

      if (rows.length < MAX_PAGE_SIZE) break
    }

    return { slugs, at: Date.now() }
  } catch {
    return null
  }
}

/**
 * After a failed refresh, do not ask again for this long. A failure used to be
 * forgotten at once, so during a backend outage every proxied request retried
 * the fetch and waited out its timeout.
 */
const RETRY_AFTER_FAILURE_MS = 60 * 1000
let lastFailureAt = 0

/** One refresh at a time: a cold instance under load makes one round of requests. */
function refresh(): Promise<SlugCache | null> {
  inflight ??= loadSlugs()
    .then((fresh) => {
      if (fresh) cache = fresh
      else lastFailureAt = Date.now()
      return fresh
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

/**
 * `false` only when the list is healthy AND the slug is definitively absent.
 * `true` covers both "it exists" and "we don't know", because the caller turns
 * `false` into a 404.
 *
 * Pass the proxy's `event.waitUntil` so a background refresh is not cut off
 * when the response is sent.
 */
export async function blogSlugMayExist(
  slug: string,
  waitUntil?: (promise: Promise<unknown>) => void,
): Promise<boolean> {
  const clean = slug.trim().toLowerCase()
  if (!clean) return true

  const now = Date.now()

  if ((!cache || now - cache.at > TTL_MS) && now - lastFailureAt > RETRY_AFTER_FAILURE_MS) {
    const pending = refresh()
    // A warm instance answers from its previous list while the refresh runs;
    // only a cold one, with nothing to answer from, waits for it.
    if (cache) waitUntil?.(pending)
    else await pending
  }

  // No healthy list: allow everything. The route still renders its own
  // noindex'd Not Found page, so this degrades to a soft 404 rather than to a
  // blog whose articles have all vanished.
  if (!cache) return true

  return cache.slugs.has(clean)
}
