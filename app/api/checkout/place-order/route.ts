import { NextRequest, NextResponse } from 'next/server'
import { BackendRefusedError, RateLimitedError } from '@/lib/backendError'
import { isPaymentRedirectOn, paymentLinkToSend } from '@/lib/paymentRedirect'
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
 *   2. the order is recorded with `status: 'unpaid'` and
 *      `payment_method: 'card'`, carrying no payment details, because none
 *      have been taken;
 *   3. the backend returns a payment link, which the browser redirects to,
 *      but only on a domain where Admin → Checkout has the payment page on
 *      (lib/paymentRedirect.ts). Everywhere else the link is left out of the
 *      answer and the customer sees "Order placed"; the team takes payment.
 *
 * No money moves here any more, which removes the failure this route was
 * built around: there is no charge left to strand when recording fails, and
 * nothing to void. It introduces the opposite one — an order can now exist
 * that was never paid for — which is what `status: 'unpaid'` is for.
 *
 * ## The cart is cleared only once the order exists
 *
 * Checkout clears the cart when this route answers `ok: true`, then redirects
 * to the payment link (see handlePlaceOrder in CheckoutClient). Any failure
 * leaves the cart untouched, so the customer can fix the problem and retry.
 * The cost: someone who abandons the payment page comes back to an empty
 * cart. Their order is `unpaid` rather than lost, but resuming it is not
 * something this storefront offers yet.
 *
 * ## What the customer is told on failure
 *
 * When the backend gave a reason (`BackendRefusedError`, `ShippingRefusedError`)
 * that reason is passed through, so a refused order says why. Anything else —
 * the backend unreachable, a non-JSON reply, a bug here — gets a fixed
 * sentence, never the raw error.
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

/** The backend's own reason when it gave one; otherwise the fallback, never a raw error. */
function customerMessage(err: unknown, fallback: string): string {
  return err instanceof BackendRefusedError || err instanceof ShippingRefusedError ? err.message : fallback
}

function reply(status: number, body: PlaceOrderResponse, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })
}

/**
 * The backend's 429 (a per-visitor or per-customer limit) as this route's
 * reply: still a 429, with the backend's message and Retry-After, so checkout
 * shows "please wait" rather than "your order failed". Null for anything else.
 */
function rateLimited(err: unknown, stage: 'total' | 'order') {
  if (!(err instanceof RateLimitedError)) return null
  return reply(429, { ok: false, stage, error: err.message }, err.retryAfter ? { 'Retry-After': String(err.retryAfter) } : {})
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

  if (isRecaptchaConfigured() && !(await verifyRecaptcha(body.recaptchaToken ?? '', 'checkout'))) {
    return reply(400, { ok: false, stage: 'validation', error: 'reCAPTCHA verification failed. Please try again.' })
  }

  // ── 1. Price ──────────────────────────────────────────────────────────────
  try {
    // Fresh, not the cached total, and counted against this visitor or customer.
    const total = await getOrderTotal({
      items: body.items,
      shipping_zip_code: body.shipping_zip_code,
      shipping_country: body.shipping_country,
      shipping_method: body.shipping_method,
      shipping_address_1: body.shipping_address_1,
      shipping_address_2: body.shipping_address_2,
      shipping_city: body.shipping_city,
      shipping_state: body.shipping_state,
    }, { token })
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
    const limited = rateLimited(err, 'total')
    if (limited) return limited
    console.error('[/api/checkout/place-order] total', err)
    return reply(400, {
      ok: false,
      stage: 'total',
      error: customerMessage(err, 'We could not calculate your order total. Please try again.'),
    })
  }

  // ── 2. Record as pending ──────────────────────────────────────────────────
  try {
    const created = await checkoutOrder(
      {
        ...order,
        items: body.items,
        shipping_method: body.shipping_method,
        payment_method: 'card',
        // Not 'pending': that reads as "we have it, we are working on it",
        // which is exactly wrong for an order nobody has paid for yet. The
        // backend's payment page moves it on from here.
        status: 'unpaid',
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

    // The Host header, not nextUrl.hostname: under `next start` that is the
    // server's own name whatever the visitor asked for. Decided here, not in
    // the browser, so the link is never sent where it should not be followed.
    const redirectOn = await isPaymentRedirectOn(request.headers.get('host') ?? '')
    if (paymentUrl && !redirectOn) {
      console.info('[/api/checkout/place-order] payment page off on this domain: confirming without the link')
    }

    return reply(200, { ok: true, orderNumber: orderNumberFrom(created), paymentUrl: paymentLinkToSend(paymentUrl, redirectOn) })
  } catch (err) {
    const limited = rateLimited(err, 'order')
    if (limited) return limited
    console.error('[/api/checkout/place-order] order not recorded', err)
    return reply(502, {
      ok: false,
      stage: 'order',
      error: customerMessage(err, 'We could not place your order. Please try again.'),
    })
  }
}
