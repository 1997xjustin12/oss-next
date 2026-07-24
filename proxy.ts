import { NextRequest, NextResponse } from 'next/server'
import { isMaintenanceMode } from '@/lib/maintenance'

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
const VARIANT_COOKIE = 'ab-home-variant'
const VARIANT_HEADER = 'x-ab-home-variant'
const VARIANTS = ['1', '2', '3']
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

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

  // The toggle route must never be walled — otherwise turning the wall ON locks
  // you out of turning it back OFF (and out of checking status).
  if (pathname === '/api/maintenance') return null

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
  if (await isMaintenanceMode()) {
    const maintenance = handleMaintenance(request)
    if (maintenance) return maintenance
    // bypass holder — fall through to normal handling below
  }

  // A/B assignment only concerns the homepage.
  if (request.nextUrl.pathname === '/') return handleAbTest(request)

  return NextResponse.next()
}

// Broadened from just '/' so the maintenance wall can gate every route. Excludes
// Next internals and common static assets, so CSS/JS/images/favicon still load
// on the maintenance page itself and aren't needlessly walled.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)'],
}
