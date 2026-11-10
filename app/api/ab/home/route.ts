import { identifyCrawler } from '@/config/crawlers'
import { clientIdentity } from '@/lib/clientIp'
import { parseHomeAbReport } from '@/lib/homeAb'
import { homeAbRecording, recordHomeAbReport } from '@/lib/homeAbStore'

/**
 * POST /api/ab/home — one report from the homepage A/B tracker
 * (app/(market)/(home)/_components/HomeVariantTracker.tsx), sent with
 * sendBeacon. Read by /admin/home-ab.
 *
 * Always answers 204: the sender is a page being closed and cannot act on an
 * error, and a forged report should learn nothing about why it was dropped.
 * Dropped: anything off the live site (homeAbRecording), crawlers and other
 * automated agents, bodies that are too big or not a report, and senders over
 * their rate limit (checked in the same Redis request as the write).
 */

const MAX_BODY_BYTES = 8_192
const AUTOMATED = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|python|curl|wget|httpclient|java\//i
const done = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } })

export async function POST(request: Request) {
  if (!homeAbRecording()) return done()

  const agent = request.headers.get('user-agent')
  if (!agent || AUTOMATED.test(agent) || identifyCrawler(agent)) return done()

  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > MAX_BODY_BYTES) return done()

  let raw: unknown
  try {
    const body = await request.text()
    if (body.length > MAX_BODY_BYTES) return done()
    raw = JSON.parse(body)
  } catch {
    return done()
  }
  const report = parseHomeAbReport(raw)
  if (!report) return done()

  try {
    await recordHomeAbReport(report, clientIdentity(request) ?? 'unknown')
  } catch {
    // Redis unreachable: a lost datapoint is not worth an error.
  }
  return done()
}
