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

/**
 * Params that describe the container, carried through so the summary survives.
 *
 * `zip` is passed in rather than read from the form: the destination now comes
 * from the address fields, and the review page has to price the place the
 * visitor just typed, not the one the link was opened with.
 */
function contextQuery(formData: FormData, zip: string): string {
  const query = new URLSearchParams()
  const handle = String(formData.get('handle') ?? '').trim()
  const qty = String(formData.get('qty') ?? '').trim()
  if (handle) query.set('handle', handle)
  if (zip) query.set('zip', zip)
  if (qty) query.set('qty', qty)
  return query.toString()
}

export async function submitDeliveryQuote(formData: FormData) {
  const field = (name: string) => String(formData.get(name) ?? '').trim()

  const address1 = field('address1')
  const address2 = field('address2')
  const city = field('city')
  const state = field('state')
  const addressZip = field('addressZip')
  const country = field('country') || 'US'

  const draft: QuoteDraft = {
    fullName: field('fullName'),
    phone: field('phone'),
    email: field('email'),
    // One line for everything that displays an address, composed here so the
    // review page, the lead and the product page's picker cannot disagree
    // about it. `address` also still arrives from older drafts.
    address:
      [address1, address2, city, [state, addressZip].filter(Boolean).join(' ')]
        .filter(Boolean)
        .join(', ') || field('address'),
    address1,
    address2,
    city,
    state,
    zip: addressZip,
    country,
    details: field('details'),
    invoiceSameAsDelivery: formData.get('invoiceSameAsDelivery') === 'yes',
  }

  // The address the visitor gave beats the ZIP the page was opened with: they
  // have just told us where the container is going, and pricing the quote to
  // the ZIP in the link instead would quote a different place to the one on the
  // form. The link's ZIP remains the fallback for a draft with no address ZIP.
  const zip = addressZip || field('zip')
  const query = contextQuery(formData, zip)

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
  // The parts, not the composed line: that line is non-empty as soon as any one
  // field is filled, so checking it would pass an address with no city.
  if (!address1 || !city || !state) fail('address')
  if (!draft.phone) fail('phone')
  // The destination is not a field in this form — it is chosen in the summary
  // panel's ZIP editor — so no browser validation covers it. Without it there is
  // no delivery charge to show, which is the one thing the review page exists to
  // show, so the submission is refused rather than quoting nothing.
  if (!zip) fail('zip')
  // Both are `required` on the checkbox, so the browser stops an honest submit
  // first. Re-checked here because browser validation is a convenience, not a
  // guarantee — a posted form can simply omit them, and a lead recorded without
  // the visitor agreeing to the terms is a record of something that did not
  // happen.
  if (formData.get('confirmDelivery') !== 'yes' || formData.get('agreeTerms') !== 'yes')
    fail('consent')

  await deliverQuoteRequest(
    {
      ...(String(formData.get('handle') ?? '').trim()
        ? { handle: String(formData.get('handle')).trim() }
        : {}),
      zip,
      name: draft.fullName,
      email: draft.email,
      phone: draft.phone,
      notes: [
        draft.address ? `Delivery address: ${draft.address}` : '',
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
        // Only worth saying when it is not the default — a line on every lead
        // repeating the usual case is noise sales learns to skip.
        draft.invoiceSameAsDelivery ? '' : 'Invoice address differs from the delivery address.',
      ]
        .filter(Boolean)
        .join('\n'),
    },
    undefined,
    new Date(),
    'delivery_quote_form',
  )

  // Was: redirect(`${ROUTES.DELIVERY_QUOTE_REVIEW}${query ? `?${query}` : ''}`)
  //
  // The submit button now reads "Continue to checkout", so this has to land
  // there. A button that names one destination and delivers another is worse
  // than either choice made cleanly. The review page keeps its own URL and its
  // own metadata, so nothing is orphaned — it is simply no longer forced
  // between giving details and paying.
  redirect(ROUTES.CHECKOUT)
}
