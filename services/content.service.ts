import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from '@/config/cache';
import { STORE_KEY } from '@/config/store';
import { getRedisClient } from '@/lib/redis';
import type { PageContent } from '@/types/content';

// Reads/writes the visible on-page copy authored in the admin Content Editor.
//
// Key shape mirrors seo.service.ts, under its own `content:` namespace:
//   oss-next:onsite:content:/
//   oss-next:bbq:content:/
//
// Kept in a separate key from the SEO record rather than merged into one blob:
// they're edited by different screens, and a save from one must not be able to
// clobber the other's fields.

const KEY_PREFIX = 'oss-next';

export function contentKey(path: string): string {
  return `${KEY_PREFIX}:${STORE_KEY}:content:${path}`;
}

/**
 * Redis holds whatever was last written, which may predate a change to the
 * heading registry. Anything that isn't a non-empty string is dropped, so a
 * malformed record can never blank a heading on the live page — it falls back
 * to the shipped default instead.
 */
function normalize(raw: unknown): PageContent | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;

  const headings: Record<string, string> = {};
  if (value.headings && typeof value.headings === 'object') {
    for (const [key, text] of Object.entries(value.headings as Record<string, unknown>)) {
      if (typeof text === 'string' && text.trim()) headings[key] = text.trim();
    }
  }

  const updatedAt =
    typeof value.updatedAt === 'string' && value.updatedAt.trim()
      ? value.updatedAt.trim()
      : undefined;

  return {
    headings: Object.keys(headings).length ? headings : undefined,
    updatedAt,
  };
}

/**
 * The copy overrides for one page, or null when none have been saved.
 *
 * Never throws: an unreachable Redis must mean "no overrides", not a homepage
 * that fails to render.
 */
export async function getPageContent(path: string): Promise<PageContent | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.CONTENT);

  try {
    const raw = await getRedisClient().get<unknown>(contentKey(path));
    return normalize(raw);
  } catch (error) {
    console.error(`[content] failed reading copy for ${path}:`, error);
    return null;
  }
}

/** Writes the record. Callers must revalidate CACHE_TAGS.CONTENT afterwards. */
export async function savePageContent(path: string, content: PageContent): Promise<void> {
  await getRedisClient().set(contentKey(path), content);
}

/** Drops the record so the page reverts to the copy in its own source. */
export async function deletePageContent(path: string): Promise<void> {
  await getRedisClient().del(contentKey(path));
}
