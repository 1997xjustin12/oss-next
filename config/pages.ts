import { ROUTES } from '@/config/routes';

// The app's own statically-routed pages — the set the admin Page Configurator
// can edit. This is a hand-maintained registry rather than a filesystem scan
// because a scan can't distinguish "a page with editable SEO copy" from a route
// handler, a template, or a WordPress-owned catch-all slug.
//
// Deliberately excludes:
//   - /product/[slug] and /blogs/[slug] — templates, not pages; their metadata
//     is derived per-item from product/post data.
//   - /[...slug] — WordPress owns those slugs and their SEO, not this app.
//   - /maintenance, /maintenance-control — operational pages, never indexed.
//
// Adding a page here is the only step needed to expose it in the configurator;
// the page itself then opts in by calling resolvePageMetadata (see lib/seo.ts).

export type PageGroup = 'Storefront' | 'Commerce' | 'Account';

export type NativePage = {
  /** URL-safe id — used as the configurator's route segment. */
  id: string;
  /** The live path this record configures. Also the Redis key suffix. */
  path: string;
  label: string;
  group: PageGroup;
  /** Shown in the admin list so it's obvious which pages search engines see. */
  indexable: boolean;
};

export const NATIVE_PAGES: readonly NativePage[] = [
  { id: 'home', path: ROUTES.HOME, label: 'Homepage', group: 'Storefront', indexable: true },
  { id: 'plp', path: ROUTES.PLP, label: 'Shop / Product Listing', group: 'Storefront', indexable: true },
  { id: 'blogs', path: ROUTES.BLOGS, label: 'Blog Index', group: 'Storefront', indexable: true },
  { id: 'agents', path: ROUTES.AGENTS, label: 'AI Agent Policy', group: 'Storefront', indexable: true },

  { id: 'cart', path: ROUTES.CART, label: 'Cart', group: 'Commerce', indexable: false },
  { id: 'checkout', path: ROUTES.CHECKOUT, label: 'Checkout', group: 'Commerce', indexable: false },
  { id: 'wishlist', path: ROUTES.WISHLIST, label: 'Wishlist', group: 'Commerce', indexable: false },
  { id: 'saved-quotes', path: ROUTES.SAVED_QUOTES, label: 'Saved Quotes', group: 'Commerce', indexable: false },

  { id: 'account', path: ROUTES.ACCOUNT.ROOT, label: 'My Account', group: 'Account', indexable: false },
  { id: 'account-orders', path: ROUTES.ACCOUNT.ORDERS, label: 'Orders', group: 'Account', indexable: false },
  { id: 'account-newsletter', path: ROUTES.ACCOUNT.NEWSLETTER, label: 'Newsletter', group: 'Account', indexable: false },
  { id: 'account-edit-account', path: ROUTES.ACCOUNT.EDIT_ACCOUNT, label: 'Account Details', group: 'Account', indexable: false },
  { id: 'account-edit-address', path: ROUTES.ACCOUNT.EDIT_ADDRESS, label: 'Addresses', group: 'Account', indexable: false },
  { id: 'account-downloads', path: ROUTES.ACCOUNT.DOWNLOADS, label: 'Downloads', group: 'Account', indexable: false },
  { id: 'account-payment-methods', path: ROUTES.ACCOUNT.PAYMENT_METHODS, label: 'Payment Methods', group: 'Account', indexable: false },
  { id: 'account-logout', path: ROUTES.ACCOUNT.LOGOUT, label: 'Logout', group: 'Account', indexable: false },
  { id: 'account-lost-password', path: ROUTES.ACCOUNT.LOST_PASSWORD, label: 'Lost Password', group: 'Account', indexable: false },
  { id: 'account-reset-password', path: ROUTES.ACCOUNT.RESET_PASSWORD, label: 'Reset Password', group: 'Account', indexable: false },
] as const;

export const PAGE_GROUPS: readonly PageGroup[] = ['Storefront', 'Commerce', 'Account'];

export function findNativePageById(id: string): NativePage | undefined {
  return NATIVE_PAGES.find((page) => page.id === id);
}

export function findNativePageByPath(path: string): NativePage | undefined {
  return NATIVE_PAGES.find((page) => page.path === path);
}
