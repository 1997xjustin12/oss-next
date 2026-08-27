import type { DeliveryRates, DeliveryRateOption } from '@/types/delivery'

/**
 * Readers for a delivery-rate response.
 *
 * Pure functions over the shape, deliberately kept out of
 * `services/delivery.service.ts`: that module contains a `'use cache'`
 * function, and Next refuses to pull such a module into a client bundle. The
 * PDP reads these from a Client Component, so they live here.
 */

/**
 * Whether there is a real delivery price to put on screen.
 *
 * The distinction `rates_available` fails to make. A far-flung destination
 * comes back `rates_available: true` with every delivery rate `null` and
 * `call_for_rate: true`, because anything over $1,000 is withheld upstream in
 * favour of a phone call. Pick-up is excluded here — it is always $0 and always
 * available, so counting it would make every response look quotable.
 */
export function hasQuotedDelivery(rates: DeliveryRates): boolean {
  return rates.options.some(
    (o) => o.key !== 'pick-up' && o.available && !o.call_for_rate && o.rate !== null,
  )
}

/** The delivery options worth rendering as prices, cheapest first. */
export function quotedDeliveryOptions(rates: DeliveryRates): DeliveryRateOption[] {
  return rates.options
    .filter((o) => o.available && !o.call_for_rate && o.rate !== null)
    .sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0))
}

/** The cheapest quotable delivery method, or null when the customer must call. */
export function cheapestDeliveryOption(rates: DeliveryRates): DeliveryRateOption | null {
  return quotedDeliveryOptions(rates).find((o) => o.key !== 'pick-up') ?? null
}
