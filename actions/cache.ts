'use server';

import { revalidateTag, updateTag } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';
import { CACHE_TAGS, type CacheTag } from '@/config/cache';
import { hasAdminAccess } from '@/lib/adminGuard';

/**
 * Busts the entire store cache via the global tag.
 * Stale content is served immediately while fresh content regenerates in the background.
 * Call this from admin actions (e.g. bulk product import, settings change).
 */
export async function revalidateAll() {
  revalidateTag(CACHE_TAGS.ALL, 'max');
}

/**
 * Immediately expires the store cache — the next request blocks until fresh.
 * Use for read-your-own-writes scenarios (user must see their change right away).
 * Can only be called inside a Server Action.
 */
export async function updateAll() {
  updateTag(CACHE_TAGS.ALL);
}

/**
 * The admin Cache screen's purge button.
 *
 * Uses `updateTag`, not `revalidateTag`. Someone who has just clicked "purge" is
 * about to reload a page to check it worked, and stale-while-revalidate would
 * hand them the old copy at exactly that moment — making the button look broken
 * when it wasn't. Immediate expiry costs one slow request and is the only
 * behaviour that matches what the button appears to promise.
 *
 * Re-checks admin access for itself: a Server Action is its own endpoint, and
 * the layout gate does not cover its POST target.
 */
export async function purgeCacheAction(formData: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const requested = String(formData.get('tag') ?? CACHE_TAGS.ALL);

  // Only tags we define. An arbitrary string would silently match nothing and
  // still report success.
  const known = new Set<string>(Object.values(CACHE_TAGS));
  if (!known.has(requested)) notFound();

  const tag = requested as CacheTag;
  updateTag(tag);

  redirect(`${ADMIN_ROUTES.CACHE}?purged=${encodeURIComponent(tag)}`);
}
