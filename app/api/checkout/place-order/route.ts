import { NextRequest, NextResponse } from 'next/server'
import { isRecaptchaConfigured, verifyRecaptcha } from '@/lib/recaptcha'
import { ShippingRefusedError } from '@/lib/shippingQuote'
import { checkoutOrder, getOrderTotal } from '@/services/order.service'
// Payment moved to the backend's own page on 2026-10-12; the charge and
// void helpers are still in services/payment.service.ts for /api/braintree_token
// and for refunds, they are simply not used from here any more.
// import { chargeBraintreeCheckout, voidBraintreeTransaction } from '@/services/payment.service'
import type { PlaceOrderRequest, PlaceOrderResponse } from '@/types/order'

/**
 * Records an order as pending and hands back the backend's payment link.
 *
 * ## The flow changed on 2026-10-12
 *
 * This route used to price, charge the card through Braintree, record the
 * order as paid with the transaction id, and void the charge if recording
 * failed. Payment now happens after the order exists, on a page the backend
 * owns:
 *
 *   1. the total is recomputed from the cart (never taken from the request),
 *      and the order is refused if it comes out higher than the page showed;
 *   2. the order is recorded with `status: 'pending'` and
 *      `payment_method: 'card'`, carrying no payment details, because none
 *      have been taken;
 *   3. the backend returns a payment link, which the browser redirects to.
 *
 * No money moves here any more, which removes the failure this route was
 * built around: there is no charge left to strand when recording fails, and
 * nothing to void. It introduces the opposite one — an order can now exist
 * that was never paid for — which is what `status: 'pending'` is for.
 *
 * ## The cart is not cleared when we redirect
 *
 * Checkout keeps the cart on the way to the payment page. An order exists by
 * then, so clearing it would stop a second attempt becoming a second order —
 * but the customer has not paid, and a visitor who abandons payment or loses
 * their connection would come back to an empty cart with no way to resume. A
 * pending order is recoverable; their cart is not.
 *
 * **Nothing clears the cart after a successful payment yet.** There is no
 * return route in this app — no /checkout/success, no callback handler — so
 * if the backend's payment page sends the customer back here, it currently
 * lands on an ordinary page with their cart still full. Closing that needs the
 * return URL the payment page uses, which has not been supplied.
 *
 * Guests and signed-in customers use the same path. The Authorization header
 * is forwarded only when the browser sent one: the backend accepts an order
 * without it as a guest order (confirmed 2026-09-15 — anonymous callers get past
 * its permission check on api/orders/checkout, unlike api/auth/orders).
 */

const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

/** Cents of slack, to absorb rounding rather than real disagreement. */
const AMOUNT_TOLERANCE = 0.01

// type Payer = Parameters<typeof chargeBraintreeCheckout>[2]

function reply(status: number, body: PlaceOrderResponse) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

/** The create response's shape was never pinned down; read the number defensively. */
function orderNumberFrom(created: unknown): string | undefined {
  const c = created as {
    order_number?: unknown
    order?: { order_number?: unknown }
    data?: { order_number?: unknown }
  } | null
  const n = c?.order_number ?? c?.order?.order_number ?? c?.data?.order_number
  return typeof n === 'string' || typeof n === 'number' ? String(n) : undefined
}

/**
 * The payment link, wherever the backend puts it.
 *
 * Read across the plausible names rather than one, for the same reason
 * `orderNumberFrom` does: the create response's shape has never been pinned
 * down, and this one was described in a sentence rather than a schema. The
 * first match wins, and the key that matched is logged once so the real field
 * name can be confirmed from a live order and this list narrowed.
 *
 * Only absolute http(s) URLs are accepted. A relative path would resolve
 * against this storefront's origin, sending the customer to a page here that
 * does not exist instead of to the payment page.
 */
function paymentUrlFrom(created: unknown): string | undefined {
  const root = (created ?? {}) as Record<string, unknown>
  const nested = [root, root.order, root.data].filter(
    (v): v is Record<string, unknown> => !!v && typeof v === 'object',
  )

  const KEYS = ['payment_link', 'payment_url', 'paymentUrl', 'paymentLink', 'checkout_url', 'invoice_url', 'redirect_url']

  for (const obj of nested) {
    for (const key of KEYS) {
      const value = obj[key]
      if (typeof value === 'string' && /^https?:\/\//i.test(value.trim())) {
        console.info('[/api/checkout/place-order] payment link read from key:', key)
        return value.trim()
      }
    }
  }
  return undefined
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || undefined
  const body = (await request.json().catch(() => null)) as PlaceOrderRequest | null

  // ── Validate ──────────────────────────────────────────────────────────────
  // No card check here any more: nothing is collected on this site, so there
  // is nothing to validate until the backend's payment page.
  if (!Array.isArray(body?.items) || body.items.length === 0) {
    return reply(400, { ok: false, stage: 'validation', error: 'Your cart is empty.' })
  }
  const order = body.order
  // The backend requires a shipping phone; an email is how the customer hears
  // about the order at all, and the only contact a guest leaves.
  if (!order?.shipping_phone || !order?.billing_email || !order?.shipping_email) {
    return reply(400, { ok: false, stage: 'validation', error: 'Please complete your email and phone number.' })
  }

  if (isRecaptchaConfigured() && !(await verifyRecaptcha(body.recaptchaToken ?? ''))) {
    return reply(400, { ok: false, stage: 'validation', error: 'reCAPTCHA verification failed. Please try again.' })
  }

  // ── 1. Price ──────────────────────────────────────────────────────────────
  try {
    const total = await getOrderTotal({
      items: body.items,
      shipping_zip_code: body.shipping_zip_code,
      shipping_country: body.shipping_country,
      shipping_method: body.shipping_method,
      shipping_address_1: body.shipping_address_1,
      shipping_address_2: body.shipping_address_2,
      shipping_city: body.shipping_city,
      shipping_state: body.shipping_state,
    })
    if (!Number.isFinite(total?.total_price) || total.total_price <= 0) {
      throw new Error('Order total came back invalid.')
    }
    const shown = Number(body.expectedAmount)
    if (Number.isFinite(shown) && total.total_price - shown > AMOUNT_TOLERANCE) {
      // Billing more than the customer agreed to is never acceptable, even
      // when our number is the correct one — make them review it instead.
      // Still worth doing with payment moved off-site: this is the figure the
      // pending order is recorded at, and the payment page bills from it.
      console.warn(`[/api/checkout/place-order] refusing to overcharge: server ${total.total_price} > shown ${shown}`)
      return reply(409, { ok: false, stage: 'total', error: 'Your order total has changed. Please review it and try again.' })
    }
  } catch (err) {
    const message =
      err instanceof ShippingRefusedError ? err.message : 'We could not calculate your order total. Please try again.'
    console.error('[/api/checkout/place-order] total', err)
    return reply(400, { ok: false, stage: 'total', error: message })
  }

  // ── 2. Record as pending ──────────────────────────────────────────────────
  try {
    const created = await checkoutOrder(
      {
        ...order,
        items: body.items,
        shipping_method: body.shipping_method,
        payment_method: 'card',
        status: 'pending',
        // No payment has been taken, so there is nothing truthful to put in
        // `payment_status` or `payment_details`. The backend's payment page
        // owns both from here.
        payment_status: false,
        store_domain: STORE_DOMAIN,
      },
      token,
    )

    const paymentUrl = paymentUrlFrom(created)
    if (!paymentUrl) {
      // The order exists — saying otherwise would invite a duplicate — but
      // nobody can pay for it from here. Reported as a success with no link so
      // the browser shows the confirmation rather than an error, and logged
      // loudly because it means the backend contract is not what was expected.
      console.error(
        '[/api/checkout/place-order] order recorded but no payment link in the response; keys:',
        created && typeof created === 'object' ? Object.keys(created).join(',') : typeof created,
      )
    }

    return reply(200, { ok: true, orderNumber: orderNumberFrom(created), paymentUrl })
  } catch (err) {
    console.error('[/api/checkout/place-order] order not recorded', err)
    return reply(502, {
      ok: false,
      stage: 'order',
      error: err instanceof Error ? err.message : 'Could not record the order.',
    })
  }
}
