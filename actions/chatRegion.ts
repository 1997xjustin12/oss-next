'use server';

import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';
import { hasAdminAccess } from '@/lib/adminGuard';
import { setChatStrict } from '@/lib/chatCountries';

/**
 * The admin AI Assistant screen's country switch.
 *
 * Re-checks admin access for itself: a Server Action is its own endpoint, and
 * the layout gate does not cover its POST target. Same reasoning as
 * `purgeCacheAction` — see `actions/cache.ts`.
 *
 * The submitted value is compared against the literal `'strict'` rather than
 * coerced with something like `Boolean(value)`, because every string except the
 * empty one is truthy: a form that posted `"off"` would silently turn the
 * restriction *on*.
 *
 * No cache tag is busted. The switch is read through its own short-TTL cache in
 * `lib/chatCountries.ts`, not through `'use cache'`, and nothing rendered is
 * derived from it — the widget asks `/api/chat/availability` at runtime.
 */
export async function setChatCountriesAction(formData: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const strict = String(formData.get('mode') ?? '') === 'strict';
  await setChatStrict(strict);

  redirect(`${ADMIN_ROUTES.CHAT}?saved=${strict ? 'strict' : 'relaxed'}`);
}
