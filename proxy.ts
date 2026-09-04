import { NextRequest, NextResponse } from 'next/server'
import { isMaintenanceMode } from '@/lib/maintenance'
import { isAdminOpenEnv, isAdminPath, isPreviewOrDev } from '@/lib/admin'
import { ADMIN_COOKIE, verifyAdminToken } from '@/lib/adminSession'
import { wpPathMayExist } from '@/lib/wpPaths'
import { blogSlugMayExist } from '@/lib/blogSlugs'
import { ROUTES } from '@/config/routes'
import { recordAgentHit } from '@/lib/agentLog'
import { isNativePath } from '@/config/routes'

// ── Maintenance wall ────────────────────────────────────────────────────────
// When the wall is up, every request is served the /maintenance page with a
// 503, EXCEPT a holder of the bypass cookie (so you and QA can verify the live
// site while it's walled for everyone else).
//
// State comes from lib/maintenance.ts, which layers a Redis flag (flip it in
// seconds via POST /api/maintenance, no redeploy) under an env kill-switch
// (MAINTENANCE_MODE, which forces the wall on even if Redis is down). The Redis
// read is cached with a short TTL, so this is not a per-request round-trip.
const MAINTENANCE_PATH = '/maintenance'
const BYPASS_COOKIE = 'maintenance-bypass'
// Visiting ?maintenance-bypass=<token> sets the cookie, then subsequent
// requests pass through. Unset token => bypass disabled (nobody can slip past).
const BYPASS_TOKEN = process.env.MAINTENANCE_BYPASS_TOKEN

// Retry-After in seconds — tells crawlers/monitors this is temporary, so a
// maintenance window isn't mistaken for the site going permanently dark.
const RETRY_AFTER = '3600'

// ── Homepage A/B/C test ─────────────────────────────────────────────────────
// Single canonical URL (/) instead of separate /version2 /version3 routes,
// which were live, crawlable, duplicate-content pages with their own (wrong)
// canonical + hand-rolled JSON-LD. The proxy assigns a sticky variant per
// visitor and forwards it as a request header; (home)/page.tsx reads that
// header to pick which Hero variant to render.
// The three Hero designs used to be the /version2 and /version3 routes; they
// now live as branches inside (home)/_components/Hero.tsx.
const VARIANT_COOKIE = 'ab-home-variant'
const VARIANT_HEADER = 'x-ab-home-variant'
const VARIANT_PARAM = 'variant'
const VARIANTS = ['1', '2', '3']
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// ── Markdown representation ─────────────────────────────────────────────────
// Every page is also available as Markdown, two ways:
//
//   GET /privacy-policy.md
//   GET /privacy-policy      Accept: text/markdown
//
// Both rewrite to /api/md/<path>, so the Markdown view is an implementation
// detail rather than a second set of public URLs competing for canonicalisation.
// A rewrite, not a redirect: the URL the consumer asked for is the URL it keeps.
const MD_SUFFIX = '.md'
const MD_HANDLER = '/api/md'

/** Does this client explicitly prefer Markdown over HTML? */
function wantsMarkdown(request: NextRequest): boolean {
  const accept = request.headers.get('accept') ?? ''
  if (!/text\/markdown/i.test(accept)) return false
  // A browser sends `text/html,...,*/*` — the wildcard must not count as a
  // request for Markdown, so HTML winning anywhere in the header disqualifies.
  return !/text\/html/i.test(accept)
}

function handleMarkdown(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  // Never negotiate away from the API or Next internals — those already speak
  // their own content types, and /api/md would rewrite onto itself.
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) return null

  // `/` becomes `/api/md` with no trailing segment, which is why the handler is
  // an optional catch-all — the homepage has a Markdown view too.
  const toHandler = (path: string) => `${MD_HANDLER}${path.replace(/\/+$/, '')}`

  if (pathname.endsWith(MD_SUFFIX)) {
    return NextResponse.rewrite(
      new URL(toHandler(pathname.slice(0, -MD_SUFFIX.length)), request.url),
    )
  }

  if (wantsMarkdown(request)) {
    return NextResponse.rewrite(new URL(toHandler(pathname), request.url))
  }

  return null
}

/**
 * Turn a missing WordPress path into a real 404 before anything streams.
 *
 * Scope is deliberately narrow — only paths that would fall through to the
 * catch-all. Native routes, the API, Next internals and the Markdown handler
 * all own their own responses and must not be second-guessed here.
 *
 * `wpPathMayExist` fails open, so a backend blip degrades this to the previous
 * behaviour (a noindex'd Not Found page with a 200) rather than to a site that
 * 404s everything.
 */
async function handleMissingWpPath(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) return null

  // Strip the Markdown suffix first: /foo.md exists exactly when /foo does.
  const target = pathname.endsWith(MD_SUFFIX)
    ? pathname.slice(0, -MD_SUFFIX.length) || '/'
    : pathname

  // /blogs/{slug} is a native route, so the WordPress list can't answer for it
  // — it has its own list and its own check.
  const blogPath = await handleBlogPath(request, target)
  if (blogPath !== undefined) return blogPath

  if (isNativePath(target)) return null
  if (await wpPathMayExist(target)) return null

  return notFoundRewrite(request)
}

/**
 * Verdict for a path under `/blogs/`.
 *
 * `undefined` means "not mine, keep checking"; `null` means "let it through";
 * a response means 404. Three states rather than two because this handler sits
 * in the middle of a chain and "no opinion" is different from "allow".
 */
async function handleBlogPath(
  request: NextRequest,
  pathname: string,
): Promise<NextResponse | null | undefined> {
  const prefix = `${ROUTES.BLOGS}/`
  if (!pathname.startsWith(prefix)) return undefined

  const rest = pathname.slice(prefix.length).replace(/\/+$/, '')

  // `/blogs/` — a trailing slash on the index. Next normalises it; not ours.
  if (!rest) return null

  // Deeper than one segment: no route file matches, so this is a certain 404
  // and needs no list to decide.
  if (rest.includes('/')) return notFoundRewrite(request)

  let slug: string
  try {
    slug = decodeURIComponent(rest)
  } catch {
    // Malformed percent-encoding can't name a real post, but let the route
    // answer for it rather than guessing here.
    return null
  }

  return (await blogSlugMayExist(slug)) ? null : notFoundRewrite(request)
}

/**
 * Rewrite rather than a bare body, so the visitor gets the app's real not-found
 * page (chrome, styling, navigation) with an honest status.
 */
function notFoundRewrite(request: NextRequest): NextResponse {
  return NextResponse.rewrite(new URL('/_not-found', request.url), { status: 404 })
}

function handleMaintenance(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl

  // Let anyone with the token set the bypass cookie and continue. Done first so
  // it works even while the wall is up.
  if (BYPASS_TOKEN && searchParams.get(BYPASS_COOKIE) === BYPASS_TOKEN) {
    const res = NextResponse.redirect(new URL(pathname, request.url))
    res.cookies.set(BYPASS_COOKIE, BYPASS_TOKEN, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })
    return res
  }

  const hasBypass = BYPASS_TOKEN && request.cookies.get(BYPASS_COOKIE)?.value === BYPASS_TOKEN
  if (hasBypass) return null // let it through untouched

  // Avoid rewriting the maintenance page onto itself (would loop).
  if (pathname === MAINTENANCE_PATH) return null

  // The toggle route and its browser control page must never be walled —
  // otherwise turning the wall ON locks you out of turning it back OFF.
  if (pathname === '/api/maintenance' || pathname === '/maintenance-control') return null

  // API clients expect JSON, not an HTML page — answer them with a 503 JSON
  // body rather than rewriting the route to the maintenance markup.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable for maintenance.' },
      { status: 503, headers: { 'Retry-After': RETRY_AFTER, 'Cache-Control': 'no-store' } },
    )
  }

  // Serve the maintenance page in place, keeping the original URL, with a 503
  // so search engines treat it as temporary. `status` is honoured because
  // MiddlewareResponseInit extends ResponseInit.
  return NextResponse.rewrite(new URL(MAINTENANCE_PATH, request.url), {
    status: 503,
    headers: { 'Retry-After': RETRY_AFTER, 'Cache-Control': 'no-store' },
  })
}

function handleAbTest(request: NextRequest): NextResponse {
  // Preview escape hatch: /?variant=2 forces that Hero, so all three designs
  // can be reviewed on demand. Without it there is no way to see the other two
  // — assignment is random on first visit and then pinned for 30 days.
  //
  // Gated to dev/preview by the same check that gates /admin. In production the
  // param is ignored entirely, so it can neither skew live A/B numbers nor hand
  // a crawler a second URL for the homepage.
  const forced = request.nextUrl.searchParams.get(VARIANT_PARAM)
  if (forced && VARIANTS.includes(forced) && isPreviewOrDev()) {
    const previewHeaders = new Headers(request.headers)
    previewHeaders.set(VARIANT_HEADER, forced)
    // Deliberately does not touch the cookie — previewing a variant must not
    // change which one you're actually enrolled in.
    return NextResponse.next({ request: { headers: previewHeaders } })
  }

  const existing = request.cookies.get(VARIANT_COOKIE)?.value
  const variant =
    existing && VARIANTS.includes(existing)
      ? existing
      : VARIANTS[Math.floor(Math.random() * VARIANTS.length)]

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(VARIANT_HEADER, variant)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  if (!existing) {
    response.cookies.set(VARIANT_COOKIE, variant, {
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      sameSite: 'lax',
    })
  }

  return response
}

export async function proxy(request: NextRequest) {
  // ── Admin gate ────────────────────────────────────────────────────────────
  // The admin layout refuses to render on its own, and each Server Action
  // re-checks; this is the outermost of those three layers, so an admin URL
  // never reaches the app at all without a session. Checked before maintenance
  // so the result is the same either way — a plain 404, with nothing that hints
  // the route exists, whether the visitor is a stranger or a signed-in customer
  // who simply isn't on the allowlist.
  if (isAdminPath(request.nextUrl.pathname) && !(await hasAdminSession(request))) {
    return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  }

  if (await isMaintenanceMode()) {
    const maintenance = handleMaintenance(request)
    if (maintenance) return maintenance
    // bypass holder — fall through to normal handling below
  }

  // Real 404s for missing WordPress paths. Must happen here, before anything
  // streams: once the catch-all's Suspense boundary flushes, the status line is
  // already sent and notFound() can only change the body. See lib/wpPaths.ts.
  const notFoundResponse = await handleMissingWpPath(request)
  if (notFoundResponse) {
    await logAgent(request, 404)
    return notFoundResponse
  }

  // After maintenance (a walled site must not serve content as Markdown either)
  // and before the A/B branch, so `/?...` with Accept: text/markdown gets the
  // Markdown homepage rather than being handed a Hero variant it can't render.
  const markdown = handleMarkdown(request)
  if (markdown) return markdown

  // Logged last, so the status recorded is the one actually returned. Only
  // known agents cost anything here — see lib/agentLog.ts.
  await logAgent(request, 200)

  // A/B assignment only concerns the homepage.
  if (request.nextUrl.pathname === '/') return handleAbTest(request)

  return NextResponse.next()
}

/**
 * May this request see the admin section?
 *
 * Open on a local dev box; everywhere else it takes the signed cookie that
 * /api/auth/login issues to allowlisted accounts. No network call and no
 * session-token decoding — just one HMAC verification, and only on /admin
 * paths, so ordinary traffic pays nothing for this.
 */
async function hasAdminSession(request: NextRequest): Promise<boolean> {
  if (isAdminOpenEnv()) return true

  const token = request.cookies.get(ADMIN_COOKIE)?.value
  return (await verifyAdminToken(token)) !== null
}

/**
 * Record a request if it came from a crawler we track.
 *
 * Awaited rather than fired-and-forgotten: an un-awaited promise in a proxy can
 * be killed when the response is returned, which would make the counters
 * silently lossy — and a metric you can't trust is worse than no metric. The
 * cost lands only on identified agents, never on human traffic.
 */
async function logAgent(request: NextRequest, status: number): Promise<void> {
  const userAgent = request.headers.get('user-agent')
  if (!userAgent) return
  await recordAgentHit(userAgent, request.nextUrl.pathname, status)
}

// Broadened from just '/' so the maintenance wall can gate every route. Excludes
// Next internals and common static assets, so CSS/JS/images/favicon still load
// on the maintenance page itself and aren't needlessly walled.
//
// Every static extension served from public/ has to be listed here. Anything
// missing is treated as a page path, and since it is not a native route and
// the backend has never heard of it, the proxy 404s it — which is exactly what
// happened to the resource PDFs, and to /llms.txt before them. Add the
// extension when a new kind of asset lands in public/.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|pdf)$).*)'],
}
