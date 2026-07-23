import { NextRequest, NextResponse } from 'next/server'

// Homepage A/B/C test — single canonical URL (/) instead of separate
// /version2 /version3 routes, which were live, crawlable, duplicate-content
// pages with their own (wrong) canonical + hand-rolled JSON-LD. The proxy
// assigns a sticky variant per visitor and forwards it as a request header;
// (home)/page.tsx reads that header to pick which Hero variant to render.
const VARIANT_COOKIE = 'ab-home-variant'
const VARIANT_HEADER = 'x-ab-home-variant'
const VARIANTS = ['1', '2', '3']
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== '/') return NextResponse.next()

  const existing = request.cookies.get(VARIANT_COOKIE)?.value
  const variant = existing && VARIANTS.includes(existing)
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

export const config = {
  matcher: '/',
}
