'use server';

import { updateTag } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';
import { CACHE_TAGS } from '@/config/cache';
import { hasAdminAccess } from '@/lib/adminGuard';
import { conformPlpOrder } from '@/lib/plpOrder';
import { savePlpOrder } from '@/lib/plpOrderSettings';

/**
 * Admin → Listing Order: save the container listing's Default order, or reset
 * it to config/plpOrder.ts.
 *
 * Re-checks admin access for itself: a Server Action is its own endpoint, and
 * the layout gate does not cover its POST target (actions/productPanel.ts).
 *
 * The order arrives as JSON in `order` and is kept only if it is a pure
 * reordering of the default (conformPlpOrder): anything else is refused rather
 * than half-saved. `updateTag` on the settings and on the search results, so
 * the listing shows the new order on the next request rather than when its
 * cached results expire.
 */
export async function savePlpOrderAction(formData: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const reset = formData.get('intent') === 'reset';
  if (!reset) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(String(formData.get('order') ?? ''));
    } catch {
      redirect(`${ADMIN_ROUTES.LISTING_ORDER}?error=invalid`);
    }
    const order = conformPlpOrder(parsed);
    // conformPlpOrder falls back per list; a save that needed a fallback is
    // not what the admin asked for, so refuse it instead. Compared list by
    // list, so the order of the object's keys does not matter.
    const lists = (o: unknown) => {
      const v = (o ?? {}) as { keys?: unknown; term?: { rental?: unknown; rto?: unknown }; grade?: unknown; size?: unknown };
      return JSON.stringify([v.keys, v.term?.rental, v.term?.rto, v.grade, v.size]);
    };
    if (lists(order) !== lists(parsed)) redirect(`${ADMIN_ROUTES.LISTING_ORDER}?error=invalid`);
    try {
      await savePlpOrder(order);
    } catch (err) {
      console.error('[plp-order] save failed:', err);
      redirect(`${ADMIN_ROUTES.LISTING_ORDER}?error=save`);
    }
  } else {
    try {
      await savePlpOrder(null);
    } catch (err) {
      console.error('[plp-order] reset failed:', err);
      redirect(`${ADMIN_ROUTES.LISTING_ORDER}?error=save`);
    }
  }

  updateTag(CACHE_TAGS.SETTINGS);
  updateTag(CACHE_TAGS.SEARCH);
  redirect(`${ADMIN_ROUTES.LISTING_ORDER}?saved=${reset ? 'reset' : '1'}`);
}
