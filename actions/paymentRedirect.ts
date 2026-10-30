'use server';

import { notFound, redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/config/admin';
import { hasAdminAccess } from '@/lib/adminGuard';
import { normalizeHost, setPaymentRedirect } from '@/lib/paymentRedirect';

/**
 * Admin → Checkout: turn the payment-page redirect on or off for one domain.
 *
 * Re-checks admin access for itself: a Server Action is its own endpoint, and
 * the layout gate does not cover its POST target. Same reasoning as
 * `setProductPanelVersionAction` (actions/productPanel.ts).
 *
 * `on` is compared against the literal `'on'`, so any other value, a missing
 * one included, turns it off: off is the safe direction for this switch.
 */
export async function setPaymentRedirectAction(formData: FormData): Promise<void> {
  if (!(await hasAdminAccess())) notFound();

  const host = normalizeHost(String(formData.get('host') ?? ''));
  const on = String(formData.get('on') ?? '') === 'on';
  if (!host) redirect(`${ADMIN_ROUTES.CHECKOUT}?error=host`);

  try {
    await setPaymentRedirect(host, on);
  } catch (err) {
    console.error('[payment-redirect] save failed:', err);
    redirect(`${ADMIN_ROUTES.CHECKOUT}?error=save`);
  }

  redirect(`${ADMIN_ROUTES.CHECKOUT}?saved=${encodeURIComponent(host)}&on=${on ? '1' : '0'}`);
}
