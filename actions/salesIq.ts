'use server';

import { updateTag } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';
import { CACHE_TAGS } from '@/config/cache';
import { normalizeSalesIqPath } from '@/config/salesIq';
import { hasAdminAccess } from '@/lib/adminGuard';
import { setSalesIqPathExcluded } from '@/lib/salesIq';

/**
 * Admin → Live Chat: add a page to the list that leaves out the chat, or take it off.
 *
 * Re-checks admin access for itself: a Server Action is its own endpoint, and the
 * layout gate does not cover its POST target. Same reasoning as
 * `setProductPanelVersionAction` (actions/productPanel.ts).
 */
export async function setSalesIqPathAction(formData: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const path = normalizeSalesIqPath(String(formData.get('path') ?? ''));
  const excluded = String(formData.get('excluded') ?? '') === 'on';
  if (!path) redirect(`${ADMIN_ROUTES.LIVE_CHAT}?error=path`);

  try {
    await setSalesIqPathExcluded(path, excluded);
  } catch (err) {
    console.error('[live-chat] save failed:', err);
    redirect(`${ADMIN_ROUTES.LIVE_CHAT}?error=save`);
  }
  updateTag(CACHE_TAGS.SETTINGS);

  redirect(`${ADMIN_ROUTES.LIVE_CHAT}?saved=${encodeURIComponent(path)}&excluded=${excluded ? '1' : '0'}`);
}
