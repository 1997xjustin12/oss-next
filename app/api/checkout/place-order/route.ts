import { NextRequest, NextResponse } from 'next/server'
import { isRecaptchaConfigured, verifyRecaptcha } from '@/lib/recaptcha'
import { ShippingRefusedError } from '@/lib/shippingQuote'
import { checkoutOrder, getOrderTotal } from '@/services/order.service'
import { chargeBraintreeCheckout, voidBraintreeTransaction } from '@/services/payment.service'
import type { PlaceOrderRequest, PlaceOrderResponse } from '@/types/order'

/**
 * Places an order in one server step: price, charge, record — and void the
 * charge if the order cannot be recorded.
 *
 * Replaces two browser calls (/api/braintree_checkout, then /api/orders/checkout).
 * With those, the browser told the backend an order was paid and handed it a
 * transaction id, so anyone could post a "paid" order without paying; and a
 * charge whose order then failed stayed charged. Here the browser only supplies
 * the card nonce, the cart and the customer's details:
 *
 *   1. the total is recomputed from the cart (never taken from the request),
 *      and the charge is refused if it is higher than the page showed;
 *   2. the card is charged;
 *   3. the order is recorded as paid, carrying the verified transaction id in
 *      the backend's own `payment_details` / `payment_status` fields;
 *   4. if recording fails, the charge is voided.
 *
 * Guests and signed-in customers use the same path. The Authorization header
 * is forwarded only when the browser sent one: the backend accepts an order
 * without it as a guest order (confirmed 2026-09-15 — anonymous callers get past
 * its permission check on api/orders/checkout, unlike api/auth/orders).
 */

const STORE_DOMAIN = process.env.NEXT_PUBLIC_STORE_DOMAIN

/** Cents of slack, to absorb rounding rather than real disagreement. */
const AMOUNT_TOLERANCE = 0.01

type Payer = Parameters<typeof chargeBraintreeCheckout>[2]

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

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || undefined
  const body = (await request.json().catch(() => null)) as PlaceOrderRequest | null

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!body?.nonce) {
    return reply(400, { ok: false, stage: 'validation', error: 'Payment details are missing. Please re-enter your card.' })
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
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
  let amount: string
  try {
    const total = await getOrderTotal({
      items: body.items,
      shipping_zip_code: body.shipping_zip_code,
      shipping_country: body.shipping_country,
      shipping_method: body.shipping_method,
    })
    if (!Number.isFinite(total?.total_price) || total.total_price <= 0) {
      throw new Error('Order total came back invalid.')
    }
    const shown = Number(body.expectedAmount)
    if (Number.isFinite(shown) && total.total_price - shown > AMOUNT_TOLERANCE) {
      // Charging more than the customer agreed to is never acceptable, even
      // when our number is the correct one — make them review it instead.
      console.warn(`[/api/checkout/place-order] refusing to overcharge: server ${total.total_price} > shown ${shown}`)
      return reply(409, { ok: false, stage: 'total', error: 'Your order total has changed. Please review it and try again.' })
    }
    amount = total.total_price.toFixed(2)
  } catch (err) {
    const message =
      err instanceof ShippingRefusedError ? err.message : 'We could not calculate your order total. Please try again.'
    console.error('[/api/checkout/place-order] total', err)
    return reply(400, { ok: false, stage: 'total', error: message })
  }

  // ── 2. Charge ─────────────────────────────────────────────────────────────
  let transactionId: string
  try {
    const transaction = await chargeBraintreeCheckout(body.nonce, amount, body.payer as Payer)
    transactionId = transaction.id
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment could not be processed.'
    console.error('[/api/checkout/place-order] charge', err)
    return reply(400, { ok: false, stage: 'charge', error: message })
  }

  // ── 3. Record ─────────────────────────────────────────────────────────────
  try {
    const created = await checkoutOrder(
      {
        ...order,
        items: body.items,
        shipping_method: body.shipping_method,
        payment_method: 'braintree',
        status: 'paid',
        payment_status: true,
        payment_details: transactionId,
        store_domain: STORE_DOMAIN,
      },
      token,
    )
    return reply(200, { ok: true, orderNumber: orderNumberFrom(created), transactionId })
  } catch (err) {
    console.error(`[/api/checkout/place-order] order not recorded after charge ${transactionId}`, err)

    // ── 4. Undo the charge ──────────────────────────────────────────────────
    if (await voidBraintreeTransaction(transactionId)) {
      return reply(502, {
        ok: false,
        stage: 'order',
        voided: true,
        error: 'We could not record your order, so your card was not charged. Please try again, or call us at (888) 977-9085.',
      })
    }
    return reply(502, {
      ok: false,
      stage: 'order',
      voided: false,
      transactionId,
      error: err instanceof Error ? err.message : 'Could not record the order.',
    })
  }
}
