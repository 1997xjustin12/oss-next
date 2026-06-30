import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { CACHE_TAGS, type CacheTag } from '@/config/cache';

/**
 * POST /api/revalidate
 *
 * Busts the store cache on demand — useful for CMS webhooks, external admin
 * tools, or CI/CD pipelines after a content deploy.
 *
 * Headers required:
 *   x-revalidate-token: <REVALIDATE_SECRET env var>
 *
 * Body (optional):
 *   { "tag": "products" }  — bust a specific tag
 *   {}                     — bust everything (uses CACHE_TAGS.ALL)
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get('x-revalidate-token');
  if (token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const tag: CacheTag = (body.tag as CacheTag) ?? CACHE_TAGS.ALL;

  const validTags = new Set<string>(Object.values(CACHE_TAGS));
  if (!validTags.has(tag)) {
    return NextResponse.json({ error: `Unknown tag: ${tag}` }, { status: 400 });
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag });
}
