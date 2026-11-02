import { after, NextResponse, type NextRequest } from 'next/server'
import { currentAdminUser } from '@/lib/adminGuard'
import { beginMerchantFeedRun, isMerchantFeedStorageConfigured, runMerchantFeedRun } from '@/services/merchantFeed.service'

/**
 * Starts a fresh generation of the three Google Merchant feeds, and answers at
 * once: the work runs after the response and takes over a minute. Its outcome is
 * on Admin → Product Feeds.
 *
 *   GET   Vercel Cron (vercel.json). Authorization: Bearer <CRON_SECRET>
 *   POST  Authorization: Bearer <CRON_SECRET>, or x-revalidate-token: <REVALIDATE_SECRET>,
 *         or a signed-in admin (the screen's Regenerate button)
 *
 * 202 started, 401 not allowed, 409 one is already running, 503 no storage yet.
 */

// after() runs within this route's limit.
export const maxDuration = 300

function hasSecret(request: NextRequest): 'cron' | 'api' | null {
  const cron = process.env.CRON_SECRET
  if (cron && request.headers.get('authorization') === `Bearer ${cron}`) return 'cron'
  const token = process.env.REVALIDATE_SECRET
  if (token && request.headers.get('x-revalidate-token') === token) return 'api'
  return null
}

async function start(by: string) {
  if (!isMerchantFeedStorageConfigured()) {
    return NextResponse.json({ ok: false, error: 'Vercel Blob is not connected to this project.' }, { status: 503 })
  }
  const run = await beginMerchantFeedRun(by)
  if (!run) return NextResponse.json({ ok: false, error: 'A run is already going.' }, { status: 409 })
  after(() => runMerchantFeedRun(run))
  return NextResponse.json({ ok: true, startedAt: run.startedAt }, { status: 202 })
}

export async function GET(request: NextRequest) {
  // Secret only: a GET can be triggered by any page an admin happens to visit.
  const by = hasSecret(request)
  if (!by) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  return start(by)
}

export async function POST(request: NextRequest) {
  const by = hasSecret(request) ?? (await currentAdminUser())
  if (!by) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  return start(by)
}
