import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { CACHE_TAGS } from '@/config/cache'

/**
 * POST /api/revalidate-plp
 *
 * Busts the Elasticsearch PLP search cache so the next request
 * fetches fresh results from Elasticsearch.
 *
 * Headers required:
 *   x-revalidate-token: <REVALIDATE_SECRET env var>
 *
 * Body (optional):
 *   { "all": true }  — also busts the full store cache (CACHE_TAGS.ALL)
 *   {}               — busts search cache only (CACHE_TAGS.SEARCH)
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get('x-revalidate-token')
  if (token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as { all?: boolean }

  revalidateTag(CACHE_TAGS.SEARCH)

  if (body.all) {
    revalidateTag(CACHE_TAGS.ALL)
  }

  return NextResponse.json({
    revalidated: true,
    tags: body.all ? [CACHE_TAGS.SEARCH, CACHE_TAGS.ALL] : [CACHE_TAGS.SEARCH],
    timestamp: new Date().toISOString(),
  })
}
