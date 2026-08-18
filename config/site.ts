// Canonical identity of the storefront — the single source of truth for who
// this site is, used by metadata, structured data, llms.txt and robots.txt.
//
// Deliberately separate from lib/helpers.ts's BASE_URL. The two answer
// different questions:
//
//   BASE_URL  "what origin is this process running on?"  -> localhost in dev
//   SITE_URL  "what origin does this site publish as?"   -> always the real one
//
// Structured-data `@id`s, canonical URLs and anything a crawler or agent will
// resolve later must use SITE_URL. A `@id` of "http://localhost:3000/#org"
// silently fragments the entity graph across environments, and a BreadcrumbList
// pointing at localhost is worse than emitting none at all.

/** Public origin this storefront publishes as, no trailing slash. */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_STORE_DOMAIN ? `https://${process.env.NEXT_PUBLIC_STORE_DOMAIN}` : '') ||
  'https://onsitestorage.com'
).replace(/\/+$/, '');

/** Resolve a site-relative path to an absolute, crawler-safe URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export const SITE = {
  name: 'On-Site Storage Solutions',
  /** Used in llms.txt and as the Organization description. */
  tagline: 'New and used shipping containers for sale and rent across the USA and Canada.',
  description:
    'On-Site Storage Solutions sells and rents new and used shipping containers — 10ft, 20ft, 40ft, high cube, and specialty units — with delivery from 130+ depots across the USA and Canada. In business since 2002.',
  url: SITE_URL,
  logo: absoluteUrl('/images/logo/oss-logo.webp'),
  telephone: '+18889779085',
  /** Display form, matches CONTACT_NUMBER in lib/helpers.ts. */
  telephoneDisplay: '(888) 977-9085',
  email: 'info@onsitestorage.com',
  address: {
    addressLocality: 'Wildomar',
    addressRegion: 'CA',
    postalCode: '92595',
    addressCountry: 'US',
  },
  foundingYear: '2002',
} as const;

/**
 * Stable `@id`s for the entities that appear on more than one page.
 *
 * Every page defines these entities at most once and references them by `@id`
 * elsewhere, so a consumer reading a product page can resolve "the seller" to
 * the same Organization it read about on the homepage. Restating the full
 * object on each page produces N unrelated organizations instead of one.
 */
export const SCHEMA_ID = {
  organization: `${SITE_URL}/#org`,
  website: `${SITE_URL}/#website`,
  /** Per-product node id — the product's own page fragment. */
  product: (handle: string) => `${SITE_URL}/product/${handle}#product`,
  /** Per-page WebPage node id. */
  webPage: (path: string) => `${absoluteUrl(path)}#webpage`,
} as const;
