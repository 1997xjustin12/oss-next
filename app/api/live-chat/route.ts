import { NextResponse } from 'next/server'
import { getSalesIqExcludedPaths } from '@/lib/salesIq'

/**
 * GET /api/live-chat → { excludedPaths: string[] }
 *
 * The storefront pages that leave out the Zoho SalesIQ chat (Admin → Live Chat).
 * SalesIqChat fetches it after mount.
 *
 * Public and identical for everyone, so the CDN answers it: a change in the admin
 * reaches visitors within a minute or so.
 */
export async function GET() {
  const excludedPaths = await getSalesIqExcludedPaths()
  return NextResponse.json(
    { excludedPaths },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  )
}
