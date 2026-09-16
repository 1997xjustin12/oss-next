import { formatMoney } from '@/lib/formatters'
import type { ShippingOption, ShippingQuote } from '@/types/order'

/**
 * The delivery method checkout pre-selects and the cart estimates with
 * (decided 2026-09-15). The backend accepts it as `shipping_method`.
 */
export const DEFAULT_SHIPPING_METHOD = 'tilt_bed'

// The backend's delivery refusals arrive as `{ shipping: ["code: message"] }`.
// These two are written for customers and change what checkout can offer, so
// their message is passed on. Anything else stays behind the generic sentence
// (see lib/backendError.ts for why raw backend output is not shown).
const CUSTOMER_FACING_CODES = ['undeliverable', 'no_address'] as const
export type ShippingRefusalCode = (typeof CUSTOMER_FACING_CODES)[number]

export class ShippingRefusedError extends Error {
  code: ShippingRefusalCode

  constructor(code: ShippingRefusalCode, message: string) {
    super(message)
    this.name = 'ShippingRefusedError'
    this.code = code
  }
}

/** The customer-facing delivery refusal in a failed get-total body, if there is one. */
export function shippingRefusal(body: unknown): { code: ShippingRefusalCode; message: string } | null {
  const list = (body as { shipping?: unknown } | null)?.shipping
  if (!Array.isArray(list)) return null
  for (const entry of list) {
    if (typeof entry !== 'string') continue
    const match = /^(\w+):\s*(.+)$/.exec(entry)
    const code = match?.[1] as ShippingRefusalCode | undefined
    if (match && code && CUSTOMER_FACING_CODES.includes(code)) return { code, message: match[2] }
  }
  return null
}

/**
 * The ZIP or postal code to price delivery with, or '' while it is incomplete.
 *
 * Every pricing request that carries a ZIP can cost the backend a paid Google
 * lookup, and a half-typed "3", "30", "303" was each sent as one (measured
 * 2026-09-15: 4 of 11 requests in one checkout). US: the first 5 digits of
 * 12345 or 12345-6789. Canada: A1A 1A1, returned with its space.
 */
export function completeZip(zip: string, country: string | undefined): string {
  const z = zip.trim().toUpperCase()
  if (country === 'CA' || /^[A-Z]/.test(z)) {
    const ca = /^([A-Z]\d[A-Z])\s?(\d[A-Z]\d)$/.exec(z)
    return ca ? `${ca[1]} ${ca[2]}` : ''
  }
  const us = /^(\d{5})(?:-?\d{4})?$/.exec(z)
  return us ? us[1] : ''
}

export function availableShippingOptions(quote: ShippingQuote | undefined): ShippingOption[] {
  // "Shipping is Additional" means "quoted and billed after the order". While
  // delivery is billed later anyway, every method already works that way, so
  // offering it as its own choice only confuses (decided 2026-09-15).
  const billedLater = isDeliveryBilledLater(quote)
  return quote?.options?.filter((option) => option.available && !(billedLater && option.id === 'additional')) ?? []
}

/**
 * The cheapest method that actually delivers the container.
 *
 * Pickup is $0 because the customer collects it, and "Shipping is Additional"
 * is $0 because it is quoted later — neither is a delivery price, and counting
 * them would make every order look free to deliver. Rates differ by method
 * (tilt bed $6/mile from a $450 minimum, flat bed $3.50/mile from $650), so
 * the cheapest one changes with distance: tilt nearby, flat once the miles add
 * up. The product page has always shown the cheapest; this is how checkout
 * agrees with it instead of always pre-selecting tilt bed.
 */
export function cheapestQuotedMethod(quote: ShippingQuote | undefined): ShippingOption | null {
  return (
    availableShippingOptions(quote)
      .filter((option) => option.id !== 'pickup' && option.id !== 'additional' && option.cost > 0)
      .sort((a, b) => a.cost - b.cost)[0] ?? null
  )
}

/**
 * The option a method id resolves to: the one asked for when it is available,
 * else the backend's own pick, else the first available one.
 */
export function selectedShippingOption(quote: ShippingQuote | undefined, methodId: string): ShippingOption | null {
  const options = availableShippingOptions(quote)
  return (
    options.find((option) => option.id === methodId) ??
    options.find((option) => option.id === quote?.selected_method) ??
    options[0] ??
    null
  )
}

/**
 * Whether delivery is quoted but billed after the order, rather than charged by
 * card at checkout. The backend runs `estimate_only` today; anything other than
 * an explicit `charge_at_checkout` is treated the same way, so a delivery price
 * is never added to a charge the backend did not include it in.
 */
export function isDeliveryBilledLater(quote: ShippingQuote | undefined): boolean {
  return quote?.charge_mode !== 'charge_at_checkout'
}

export function deliveryPriceLabel(option: ShippingOption): string {
  if (option.cost > 0) return formatMoney(option.cost)
  return option.id === 'pickup' ? 'Free' : 'Quoted after order'
}
