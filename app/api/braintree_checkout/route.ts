import { NextRequest, NextResponse } from 'next/server'
import { chargeBraintreeCheckout } from '@/services/payment.service'
import { getOrderTotal } from '@/services/order.service'
import { verifyRecaptcha, isRecaptchaConfigured } from '@/lib/recaptcha'
import type { CartLineItem } from '@/types/cart'

/**
 * The amount charged is NEVER taken from the request.
 *
 * This route used to pass the client's `amount` straight to transaction.sale(),
 * so a crafted request could buy a $3,000 container for a cent. The total is
 * now recomputed here from the cart via /api/orders/get-total, which prices
 * from `product_id` server-side — verified against the real backend that
 * tampering an item's price field leaves sub_total unchanged, so resubmitting
 * doctored line items doesn't move the charge either.
 *
 * The client still sends the total it displayed, as `expectedAmount`. That is
 * used only to refuse the charge when our figure is higher, so a customer is
 * never billed more than the page showed them.
 */

/** Cents of slack, to absorb rounding rather than real disagreement. */
const AMOUNT_TOLERANCE = 0.01

export async function POST(request: NextRequest) {
  const {
    nonce,
    items,
    shipping_zip_code,
    shipping_country,
    expectedAmount,
    recaptchaToken,
    customer,
    billing,
    shipping,
  } = await request.json().catch(() => ({}))

  if (!nonce) {
    return NextResponse.json({ error: 'Payment nonce is required.' }, { status: 400 })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'At least one cart item is required.' }, { status: 400 })
  }

  if (isRecaptchaConfigured()) {
    const recaptchaOk = await verifyRecaptcha(recaptchaToken)
    if (!recaptchaOk) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed.' }, { status: 400 })
    }
  }

  // ── Authoritative amount ──────────────────────────────────────────────────
  let amount: string
  try {
    const total = await getOrderTotal({
      items: items as CartLineItem[],
      shipping_zip_code,
      shipping_country,
    })

    if (!Number.isFinite(total?.total_price) || total.total_price <= 0) {
      throw new Error('Order total came back invalid.')
    }

    const shown = Number(expectedAmount)
    if (Number.isFinite(shown) && total.total_price - shown > AMOUNT_TOLERANCE) {
      // Charging more than the customer agreed to is never acceptable, even
      // when our number is the correct one — make them review it instead.
      console.warn(
        `[/api/braintree_checkout] refusing to overcharge: server ${total.total_price} > shown ${shown}`,
      )
      return NextResponse.json(
        { error: 'Your order total has changed. Please review it and try again.' },
        { status: 409 },
      )
    }

    amount = total.total_price.toFixed(2)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not calculate the order total.'
    console.error('[/api/braintree_checkout] total', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // ── Charge ────────────────────────────────────────────────────────────────
  try {
    // Payer details are metadata for the Braintree record — the service drops
    // any blank fields before they reach the gateway.
    const transaction = await chargeBraintreeCheckout(nonce, amount, {
      customer,
      billing,
      shipping,
    })
    return NextResponse.json({ transaction })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment could not be processed.'
    console.error('[/api/braintree_checkout]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
