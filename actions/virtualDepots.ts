'use server';

import { updateTag } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';
import { CACHE_TAGS } from '@/config/cache';
import { hasAdminAccess } from '@/lib/adminGuard';
import { setVirtualDepotsEnabled } from '@/lib/virtualDepots';

/**
 * The admin Depots screen's virtual-depot switch.
 *
 * Re-checks admin access for itself: a Server Action is its own endpoint, and
 * the layout gate does not cover its POST target (see actions/cartNotice.ts).
 * Compares against the literal 'on' rather than coercing, so a form posting
 * "off" cannot switch it on. `updateTag`: the admin who just saved sees the
 * storefront follow now.
 */
export async function setVirtualDepotsAction(formData: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const on = String(formData.get('virtual') ?? '') === 'on';
  await setVirtualDepotsEnabled(on);
  updateTag(CACHE_TAGS.SETTINGS);

  redirect(`${ADMIN_ROUTES.DEPOTS}?saved=${on ? 'on' : 'off'}`);
}
