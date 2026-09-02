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
  PRODUCT: (handle: string) => `/product/${handle}`,
  BLOGS: '/blogs',
  AGENTS: '/agents',
  BLOG: (slug: string) => `/blogs/${slug}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  WISHLIST: '/wishlist',
  /** Quotes this browser has saved from a product page. */
  SAVED_QUOTES: '/saved-quotes',
  SITEMAP: '/sitemap.xml',
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
export const NATIVE_ROUTE_SEGMENTS = [
  'product',
  'blogs',
  'cart',
  'checkout',
  'wishlist',
  'saved-quotes',
  'my-account',
  'sale-shipping-containers',
  'agents',
  // Operational and internal routes. Not reachable as WordPress content, but
  // listed so a stray backend row can never claim one of them.
  'maintenance',
  'maintenance-control',
  'admin',
  'api',
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
export function isNativePath(path: string): boolean {
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
