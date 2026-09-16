'use server';

import { updateTag } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';
import { CACHE_TAGS } from '@/config/cache';
import { hasAdminAccess } from '@/lib/adminGuard';
import { setProductPanelV2 } from '@/lib/productPanel';

/**
 * The admin Product Panel screen's version switch.
 *
 * Re-checks admin access for itself: a Server Action is its own endpoint, and
 * the layout gate does not cover its POST target. Same reasoning as
 * `setChatCountriesAction` — see `actions/chatRegion.ts`.
 *
 * The submitted value is compared against the literal `'v2'` rather than
 * coerced with something like `Boolean(value)`, because every string except the
 * empty one is truthy: a form posting `"off"` would switch V2 *on*.
 *
 * `updateTag` rather than `revalidateTag` — the admin who just clicked has to
 * see the product page change now, not on whichever request happens to trigger
 * the background refresh.
 */
export async function setProductPanelVersionAction(formData: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const v2 = String(formData.get('version') ?? '') === 'v2';
  await setProductPanelV2(v2);
  updateTag(CACHE_TAGS.SETTINGS);

  redirect(`${ADMIN_ROUTES.PRODUCT_PANEL}?saved=${v2 ? 'v2' : 'default'}`);
}
