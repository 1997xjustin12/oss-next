'use server';

import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';
import { hasAdminAccess } from '@/lib/adminGuard';
import { normalizeHost, setCheckoutOpen } from '@/lib/checkoutGate';

/**
 * Admin → Checkout: open or close checkout on one domain.
 *
 * Re-checks admin access for itself: a Server Action is its own endpoint, and
 * the layout gate does not cover its POST target. Same reasoning as
 * `setProductPanelVersionAction` (actions/productPanel.ts).
 *
 * `open` is compared against the literal `'open'`, so any other value, a
 * missing one included, closes: closing is the safe direction for this switch.
 */
export async function setCheckoutOpenAction(formData: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const host = normalizeHost(String(formData.get('host') ?? ''));
  const open = String(formData.get('open') ?? '') === 'open';
  if (!host) redirect(`${ADMIN_ROUTES.CHECKOUT}?error=host`);

  try {
    await setCheckoutOpen(host, open);
  } catch (err) {
    console.error('[checkout-gate] save failed:', err);
    redirect(`${ADMIN_ROUTES.CHECKOUT}?error=save`);
  }

  redirect(`${ADMIN_ROUTES.CHECKOUT}?saved=${encodeURIComponent(host)}&open=${open ? '1' : '0'}`);
}
