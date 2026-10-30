// Typed path constants for this app's own in-scope routes (Home, PLP, PDP,
// Cart, Checkout, My Account + subpages) — see AGENTS.md's own "Navigation"
// rule. Deliberately does NOT cover WordPress-owned content pages (Locations,
// Privacy, Terms, the quote landing page, the Navbar's mega-menu, etc.) —
// this app doesn't own those slugs, WordPress does, so encoding them here
// would misrepresent who's responsible for keeping them correct.
export const ROUTES = {
  HOME: '/',
  PLP: '/sale-shipping-containers',
  PLP_ACCESSORIES: '/sale-shipping-containers?ptype=accessories',
  /** The accessories page, native since 2026-10-26 (was a WordPress page). */
  ACCESSORY_PRODUCTS: '/shipping-container-accessory-products',
  /** The rent-to-own page, native since 2026-10-27 (was a WordPress page). */
  RENT_TO_OWN: '/shipping-container-rent-to-own-financing',
  PRODUCT: (handle: string) => `/product/${handle}`,
  BLOGS: '/blogs',
  AGENTS: '/agents',
  BLOG: (slug: string) => `/blogs/${slug}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  /** Where checkout goes while it is closed on this domain (Admin → Checkout, lib/checkoutGate.ts). */
  CHECKOUT_UNAVAILABLE: '/checkout-unavailable',
  /**
   * The depot index. This app's page as of 2026-10-13 — the cities beneath it
   * are still WordPress's, which is why it is in NATIVE_EXACT_PATHS below and
   * not in NATIVE_ROUTE_SEGMENTS.
   */
  WHERE_TO_BUY: '/where-to-buy-shipping-containers',
  WISHLIST: '/wishlist',
  /** Quotes this browser has saved from a product page. */
  SAVED_QUOTES: '/saved-quotes',
  /**
   * The delivery-quote flow. Step 3 captures contact details, step 4 shows the
   * quote those details bought. Steps 1 and 2 are the product page and its ZIP
   * field — real pages, just not ones this flow owns.
   */
  DELIVERY_QUOTE: '/get-exact-delivery-quote',
  DELIVERY_QUOTE_REVIEW: '/get-exact-delivery-quote/review',
  /**
   * The quote flow, carrying what the product page already knows.
   *
   * Built here rather than at the call site because the page reads these
   * parameters server-side, and a typo in one is invisible: the page still
   * renders, just describing a container nobody chose. Empty values are dropped
   * rather than sent as blanks.
   */
  DELIVERY_QUOTE_FOR: (params: { handle?: string; zip?: string; qty?: number }) => {
    const query = new URLSearchParams()
    if (params.handle) query.set('handle', params.handle)
    if (params.zip) query.set('zip', params.zip)
    if (params.qty && params.qty > 1) query.set('qty', String(params.qty))
    const search = query.toString()
    return search ? `/get-exact-delivery-quote?${search}` : '/get-exact-delivery-quote'
  },
  SITEMAP: '/sitemap.xml',
  /**
   * One order's status page, `/order-status/<order_uuid>`. Reached through the
   * links in the order emails; the uuid comes from the backend with the order.
   * The bare path is the canonical URL, so the uuid never lands in metadata.
   */
  ORDER_STATUS: '/order-status',
  ACCOUNT: {
    ROOT: '/my-account',
    ORDERS: '/my-account/orders',
    NEWSLETTER: '/my-account/newsletter',
    EDIT_ACCOUNT: '/my-account/edit-account',
    EDIT_ADDRESS: '/my-account/edit-address',
    DOWNLOADS: '/my-account/downloads',
    PAYMENT_METHODS: '/my-account/payment-methods',
    LOGOUT: '/my-account/logout',
    LOST_PASSWORD: '/my-account/lost-password',
    RESET_PASSWORD: '/my-account/reset-password',
  },
} as const

/**
 * URL first segments this app owns. Everything else belongs to the WordPress
 * catch-all at `app/(market)/[...slug]/page.tsx`.
 *
 * One list, three consumers, and they must agree:
 *
 *   - the catch-all, which 404s these rather than forwarding them to the pages
 *     API (guarding partial matches like "/product" with no handle);
 *   - `app/sitemap.ts`, which drops backend content-page rows whose path
 *     collides with a native route — the catch-all would 404 them, so listing
 *     them in the sitemap advertises dead URLs;
 *   - the Markdown routes, which must not claim `/cart.md`.
 *
 * Previously this lived as two hand-maintained copies that had already drifted
 * (the sitemap's copy omitted the operational routes). A third copy was one
 * feature away.
 */
/**
 * GBP location pages that are live as native routes (app/(gbp)/<slug>/). Their
 * content is lib/data/gbpPages.ts; add a slug here when its route folder
 * exists, and WordPress stops serving that page. The rest are still WordPress.
 * Reference: docs/reference/gbp-subdomain-pages.md
 */
export const GBP_ROUTE_SEGMENTS = [
  'shipping-containers-for-sale-in-san-diego-ca',
  'shipping-containers-for-sale-in-phoenix-az',
  'shipping-containers-for-sale-in-houston-tx',
  'shipping-containers-for-sale-in-wildomar-ca',
  'shipping-containers-for-sale-in-newark-nj',
  'shipping-containers-for-sale-in-los-angeles-ca',
  'shipping-containers-for-sale-in-temecula-ca',
  'shipping-containers-for-sale-in-las-vegas-nv',
  'shipping-containers-for-sale-in-oakland-ca',
  'shipping-containers-for-sale-in-miami-fl',
  'shipping-containers-for-sale-in-chicago-il',
] as const

export const NATIVE_ROUTE_SEGMENTS = [
  // GBP location pages, migrated from WordPress one at a time.
  ...GBP_ROUTE_SEGMENTS,
  'product',
  'blogs',
  'cart',
  'checkout',
  'checkout-unavailable',
  'wishlist',
  'saved-quotes',
  'get-exact-delivery-quote',
  'my-account',
  'sale-shipping-containers',
  'agents',
  'order-status',
  // Migrated from WordPress; nothing of WordPress's lives beneath them.
  'shipping-container-accessory-products',
  'shipping-container-rent-to-own-financing',
  // Operational and internal routes. Not reachable as WordPress content, but
  // listed so a stray backend row can never claim one of them.
  'maintenance',
  'maintenance-control',
  'admin',
  // The GBP screens' draft preview (app/(gbp)/admin-preview), gated like /admin.
  'admin-preview',
  'api',
  // The prebuilt homepage A/B variants, reached only through the proxy's
  // rewrite of `/` (and 404 when requested directly).
  'home-variant',
  // Machine-readable file routes. These MUST be here: the proxy 404s any
  // non-native path missing from the backend's page list, and these are served
  // by route handlers that list knows nothing about. Omitting them 404'd
  // /llms.txt and /llms-full.txt outright. (/robots.txt and /sitemap.xml only
  // escaped because the proxy matcher already excludes them.)
  'llms.txt',
  'llms-full.txt',
  'robots.txt',
  'sitemap.xml',
] as const

/**
 * Does this path's first segment belong to a native route?
 *
 * The bare root (`/`) counts as native — the homepage is `(home)/page.tsx`, and
 * the catch-all is a REQUIRED `[...slug]` precisely so it never matches it.
 */
/**
 * Native routes whose path is native but whose CHILDREN are not.
 *
 * `/where-to-buy-shipping-containers` is this app's page; every city under it
 * — `/where-to-buy-shipping-containers/atlanta-ga` and 57 others — is still
 * WordPress's. Putting the segment in the list above would make the whole
 * subtree native, which costs the real 404 those city pages get today when one
 * is missing: the proxy would stop checking them against the backend's page
 * list and a dead city URL would soft-404 instead.
 *
 * Matched on the exact path so the parent is served by us and the children
 * keep falling through to the catch-all, and their 404s keep working.
 */
const NATIVE_EXACT_PATHS: readonly string[] = [ROUTES.WHERE_TO_BUY]

export function isNativePath(path: string): boolean {
  const clean = path.replace(/[?#].*$/, '').replace(/\/+$/, '') || '/'
  if (NATIVE_EXACT_PATHS.includes(clean)) return true

  const first = path.replace(/^\/+/, '').split(/[/?#]/)[0]
  if (first === '') return true
  if ((NATIVE_ROUTE_SEGMENTS as readonly string[]).includes(first)) return true

  // A dotted first segment is a file route (llms.txt, favicon.ico, an
  // opensearch.xml we haven't written yet), never a WordPress content slug.
  // Belt to the explicit list above: the cost of being wrong here is only that
  // a path skips the proxy's early 404 and falls back to the previous
  // behaviour, whereas the cost of the reverse is a live route returning 404.
  return first.includes('.')
}
