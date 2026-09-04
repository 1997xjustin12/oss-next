'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/config/routes'
import { deliverQuoteRequest } from '@/services/quote.service'
import {
  QUOTE_DRAFT_COOKIE,
  QUOTE_DRAFT_MAX_AGE,
  type QuoteDraft,
} from '@/lib/quoteDraft'

/**
 * The delivery-quote form's submit handler.
 *
 * Details go into the draft cookie (see lib/quoteDraft.ts) before validation
 * runs, so a mistyped confirmation email does not cost the visitor everything
 * else they typed — the form repopulates from it on the way back.
 *
 * ## What happens to the lead
 *
 * `deliverQuoteRequest` writes to Redis, where the admin can read it — the
 * honest state of this app's sales pipeline, documented in quote.service.ts. It
 * throws rather than swallowing a failure, and this action lets it: a lead that
 * silently vanished is worse than one the visitor is asked to send again.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Params that describe the container, carried through so the summary survives. */
function contextQuery(formData: FormData): string {
  const query = new URLSearchParams()
  for (const key of ['handle', 'zip', 'qty'] as const) {
    const value = String(formData.get(key) ?? '').trim()
    if (value) query.set(key, value)
  }
  return query.toString()
}

export async function submitDeliveryQuote(formData: FormData) {
  const draft: QuoteDraft = {
    fullName: String(formData.get('fullName') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    contactMethod: String(formData.get('contactMethod') ?? 'phone'),
    interests: formData.getAll('interests').map(String),
    timeline: String(formData.get('timeline') ?? ''),
    details: String(formData.get('details') ?? '').trim(),
  }
  const confirmEmail = String(formData.get('confirmEmail') ?? '').trim()
  const query = contextQuery(formData)

  const store = await cookies()
  store.set(QUOTE_DRAFT_COOKIE, encodeURIComponent(JSON.stringify(draft)), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: QUOTE_DRAFT_MAX_AGE,
  })

  // Re-checked here even though the inputs carry `required` and `type=email`:
  // browser validation is a convenience for the visitor, not a guarantee to the
  // server, and this handler is reachable without it.
  const fail = (reason: string) =>
    redirect(`${ROUTES.DELIVERY_QUOTE}?${query ? `${query}&` : ''}error=${reason}`)

  if (!draft.fullName) fail('name')
  if (!EMAIL_PATTERN.test(draft.email)) fail('email')
  if (draft.email.toLowerCase() !== confirmEmail.toLowerCase()) fail('email-mismatch')
  if (!draft.phone) fail('phone')

  await deliverQuoteRequest(
    {
      ...(String(formData.get('handle') ?? '').trim()
        ? { handle: String(formData.get('handle')).trim() }
        : {}),
      zip: String(formData.get('zip') ?? '').trim(),
      name: draft.fullName,
      email: draft.email,
      phone: draft.phone,
      notes: [
        draft.details,
        // The cart is the order being asked about; without it the record names
        // only whatever single container the URL carried.
        String(formData.get('cartSummary') ?? '').trim()
          ? `Cart:
${String(formData.get('cartSummary')).trim()}` +
            (String(formData.get('cartTotal') ?? '').trim()
              ? `
Cart subtotal: ${String(formData.get('cartTotal')).trim()}`
              : '')
          : '',
        `Preferred contact: ${draft.contactMethod}`,
        draft.interests.length ? `Interested in: ${draft.interests.join(', ')}` : '',
        draft.timeline ? `Timeline: ${draft.timeline}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    },
    undefined,
    new Date(),
    'delivery_quote_form',
  )

  redirect(`${ROUTES.DELIVERY_QUOTE_REVIEW}${query ? `?${query}` : ''}`)
}
