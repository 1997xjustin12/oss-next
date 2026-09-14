'use client'

import { useDeliveryRates } from '@/hooks/useDeliveryRates'
import { useStoredZip } from '@/hooks/useStoredZip'
import { cheapestDeliveryOption } from '@/lib/delivery'
import { getCustomFieldValue, isGenericDisplayHit } from '@/lib/pricing'
import type { CartItem } from '@/types/cart'

type Estimate = {
  /** Estimated delivery for the cart, or null when none can be given. */
  amount: number | null
  /** True while the estimate is being fetched. */
  loading: boolean
  /** The ZIP the estimate is for. */
  zip: string
}

/**
 * The delivery estimate the product page adds into its subtotal, for the cart.
 *
 * The product page shows price × quantity plus the cheapest delivery rate to
 * the visitor's ZIP. The cart showed the same items with delivery "Calculated
 * at checkout", so its total came out lower than the figure the customer had
 * just seen. This asks the same endpoint the same question.
 *
 * Only for a cart with exactly one container line, bought outright. Delivery
 * for several containers is not the sum of their separate rates — it depends on
 * trucks and total length — so adding them up would be a wrong number shown
 * with confidence. Rent and rent-to-own leave delivery out of their monthly
 * figure on the product page, so they do here too.
 */
export function useCartDeliveryEstimate(items: CartItem[]): Estimate {
  const { postcode } = useStoredZip()

  const containers = items.filter((item) => item.isContainer)
  const only = containers.length === 1 ? containers[0] : null
  const hit = only?.rawHit
  const slug = typeof hit?.handle === 'string' ? hit.handle : undefined
  const eligible =
    !!hit && getCustomFieldValue(hit, 'payment_type') === 'buy' && !isGenericDisplayHit(hit)

  const { rates, loading } = useDeliveryRates({ slug, zipcode: postcode, enabled: eligible })
  const option = rates ? cheapestDeliveryOption(rates) : null

  const amount =
    only && option?.rate != null ? Math.round(option.rate * only.quantity * 100) / 100 : null

  return { amount, loading: eligible && loading, zip: postcode }
}
