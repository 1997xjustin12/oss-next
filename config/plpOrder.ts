/**
 * The container listing's Default order (/sale-shipping-containers, Buy, Rent
 * and Rent-To-Own; not accessories).
 *
 * A rule, not a list of products: each product is turned into the keys below
 * from its own fields (lib/plpOrder.ts), and products are compared key by key,
 * in `keys` order, by where their value sits in each list. So it orders every
 * depot and every payment type the same way, and a product nobody has heard of
 * still lands in the right place. Changing the order is moving a value in a
 * list.
 *
 * Taken from the live WordPress listing (docs/reference/plp-product-ordering.md,
 * surveyed 2026-10-30) and kept as it is (decided 2026-10-30):
 *
 *   1. term, longest first (rental and rent-to-own; buy has none)
 *   2. grade, Wind & Water Tight first (the best sellers)
 *   3. size, 20′ Standard first
 *
 * A value missing from a list sorts after every listed one. Ties, and products
 * missing a field, fall back to price (lowest first), then title, so the order
 * is the same on every request.
 */
export const PLP_DEFAULT_ORDER = {
  keys: ['term', 'grade', 'size'],
  /** `payment_term` values, per payment type. */
  term: {
    rental: ['12', '6', '3'],
    rto: ['48', '36', '24', '12'],
  },
  /** `condition` + `grade`, as keyed by plpOrderKeys. */
  grade: ['used-wwt', 'new-iicl', 'used-iicl', 'used-as-is', 'used-cw'],
  /** `length_width` + `height`, as keyed by plpOrderKeys. */
  size: ['20-std', '40-std', '40-hc'],
} as const

/**
 * The most products the rule orders in one list. A depot's whole list is
 * fetched and sorted (Atlanta, 2026-10-30: 15 buy, 9 rent, 48 rent-to-own), so
 * this is a ceiling, far above any depot today; past it the rest keep the
 * index's order after the sorted ones.
 */
export const PLP_ORDER_MAX_PRODUCTS = 300
