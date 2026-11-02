/**
 * The three Google Merchant data sources.
 *
 * `path` is the URL each data source in Merchant Center fetches. They are the
 * WordPress plugin's URLs, on purpose: serving the same paths here means nothing
 * has to change in Merchant Center when the domain moves to this app. next.config.ts
 * rewrites them to `/api/feeds/merchant/{source}`, and config/routes.ts marks them
 * native so the proxy does not 404 them as missing WordPress pages.
 *
 * `liveItems` is how many products each feed held when this app took them over
 * (2026-11-02). It is the safety check's reference until a first run has been
 * recorded: see MIN_ITEMS_RATIO.
 */
export const MERCHANT_FEED_SOURCES = [
  { source: 'buy', paymentType: 'buy', label: 'Buy', path: '/wp-content/uploads/buy-google-shopping.xml', liveItems: 2202 },
  { source: 'rental', paymentType: 'rental', label: 'Rental', path: '/wp-content/uploads/rental-google-shopping.xml', liveItems: 1188 },
  { source: 'rent-to-own', paymentType: 'rto', label: 'Rent-to-Own', path: '/wp-content/uploads/rent-to-own-google-shopping.xml', liveItems: 6336 },
] as const

export type MerchantFeedSource = (typeof MERCHANT_FEED_SOURCES)[number]['source']

/**
 * A run that yields fewer items than this share of the last good run replaces
 * nothing. An Elasticsearch hiccup that returns half the catalog must not remove
 * half the store's products from Google.
 */
export const MIN_ITEMS_RATIO = 0.7
