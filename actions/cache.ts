'use server';

import { revalidateTag, updateTag } from 'next/cache';
import { CACHE_TAGS } from '@/config/cache';

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
