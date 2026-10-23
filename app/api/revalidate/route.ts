import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { CACHE_TAGS } from '@/config/cache';

/**
 * POST /api/revalidate
 *
 * Busts caches on demand — for the backend after a content change, CMS
 * webhooks, external admin tools, or CI/CD pipelines after a content deploy.
 *
 * Headers required:
 *   x-revalidate-token: <REVALIDATE_SECRET env var>
 *
 * Body:
 *   { "tag": "products" }                       — bust one domain tag
 *   { "tags": ["page:/shipping-container-faqs", "page:/why-onsite-storage"] }
 *                                               — refresh just those WordPress pages
 *   { "tag": "store" }                          — explicit full purge
 *
 * An empty body is refused (400). It used to purge everything, which made an
 * accidental or malformed call the most expensive one possible: every page
 * rebuilt on its next visit.
 */

/** A per-page tag: see pageTag() in services/wp-pages.service.ts. */
const PAGE_TAG = /^page:\/[^\s?#]{0,250}$/;
const MAX_TAGS = 200;
const DOMAIN_TAGS = new Set<string>(Object.values(CACHE_TAGS));

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-revalidate-token');
  if (token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tag?: unknown; tags?: unknown };
  const requested = [
    ...(body.tag !== undefined ? [body.tag] : []),
    ...(Array.isArray(body.tags) ? body.tags : []),
  ];

  if (requested.length === 0) {
    return NextResponse.json(
      { error: 'Name a tag: { "tag": "pages" }, { "tags": ["page:/…"] }, or { "tag": "store" } to purge everything.' },
      { status: 400 },
    );
  }
  if (requested.length > MAX_TAGS) {
    return NextResponse.json({ error: `At most ${MAX_TAGS} tags per request.` }, { status: 400 });
  }

  const invalid = requested.filter(
    (tag) => typeof tag !== 'string' || !(DOMAIN_TAGS.has(tag) || PAGE_TAG.test(tag)),
  );
  if (invalid.length) {
    return NextResponse.json({ error: `Unknown tag: ${invalid.map(String).join(', ')}` }, { status: 400 });
  }

  const tags = [...new Set(requested as string[])];
  // 'max': the stale page is served once more while it rebuilds in the background.
  for (const tag of tags) revalidateTag(tag, 'max');
  return NextResponse.json({ revalidated: true, tags });
}
