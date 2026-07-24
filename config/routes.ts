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
  CART: '/cart',
  CHECKOUT: '/checkout',
  WISHLIST: '/wishlist',
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
