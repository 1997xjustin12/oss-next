'use server';

import { updateTag } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';
import { CACHE_TAGS } from '@/config/cache';
import { hasAdminAccess } from '@/lib/adminGuard';
import { setCartNoticeMode } from '@/lib/cartNotice';

/**
 * The admin Cart Notice screen's switch.
 *
 * Re-checks admin access for itself: a Server Action is its own endpoint, and
 * the layout gate does not cover its POST target. Same reasoning as
 * `setProductPanelVersionAction` — see `actions/productPanel.ts`.
 *
 * The submitted value is compared against the literal `'toast'` rather than
 * coerced, because every string except the empty one is truthy: a form posting
 * `"off"` would switch the toast on.
 *
 * `updateTag` rather than `revalidateTag` — the admin who just clicked has to
 * see the storefront change now, not on whichever request happens to trigger a
 * background refresh.
 */
export async function setCartNoticeAction(formData: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const toast = String(formData.get('mode') ?? '') === 'toast';
  await setCartNoticeMode(toast ? 'toast' : 'modal');
  updateTag(CACHE_TAGS.SETTINGS);

  redirect(`${ADMIN_ROUTES.CART_NOTICE}?saved=${toast ? 'toast' : 'modal'}`);
}
