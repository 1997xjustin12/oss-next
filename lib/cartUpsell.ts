import { CART_UPSELL_GROUPS, CART_UPSELL_MAX_ITEMS } from '@/config/cartUpsell'

type Upsellable = { title: string; sale_price: number | string }

const priceOf = (product: Upsellable) => Number(product.sale_price)

/**
 * The Added to Cart dialog's row, from every accessory (config/cartUpsell.ts).
 *
 * The cheapest match of each group, in the groups' order; a product is only ever
 * shown once. If that leaves the row short, the cheapest of the rest fill it, so
 * a missing group never leaves room for a shelter. Anything without a price is
 * left out, since it could not be added to the cart for what it costs.
 */
export function pickCartUpsell<T extends Upsellable>(products: readonly T[]): T[] {
  const cheapestFirst = products
    .filter((product) => priceOf(product) > 0)
    .sort((a, b) => priceOf(a) - priceOf(b) || a.title.localeCompare(b.title))

  const picked = new Set<T>()
  for (const group of CART_UPSELL_GROUPS) {
    if (picked.size === CART_UPSELL_MAX_ITEMS) break
    const match = cheapestFirst.find((product) => !picked.has(product) && group.title.test(product.title))
    if (match) picked.add(match)
  }
  for (const product of cheapestFirst) {
    if (picked.size === CART_UPSELL_MAX_ITEMS) break
    picked.add(product)
  }
  return [...picked]
}
