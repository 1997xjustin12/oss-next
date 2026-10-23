export const CACHE_TAGS = {
  /** Global tag — revalidating this single tag busts the entire store cache. */
  ALL:        'store',
  PRODUCTS:   'products',
  SEARCH:     'search',   // Elasticsearch PLP results
  CATEGORIES: 'categories',
  HOMEPAGE:   'homepage',
  PAGES:      'pages',    // Converted WordPress pages from the Django pages API
  SEO:        'seo',      // Per-page SEO overrides from the admin Page Configurator
  CONTENT:    'content',  // Visible on-page copy from the admin Content Editor
  BLOG:       'blog',     // Headless WordPress blog posts (bbq-blog REST API)
  ORDERS:     'orders',
  USERS:      'users',
  REVIEWS:    'reviews',
  SETTINGS:   'settings', // Runtime switches flipped from the admin screens
  PRICING:    'pricing',  // Order totals (delivery quotes) for cart and checkout
  AGENT_TRAFFIC: 'agent-traffic', // Admin crawler / MCP traffic report
  QUOTES:     'quotes',   // Admin list of quote requests (leads)
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * What each tag covers, for the admin Cache screen.
 *
 * `lifetime` is the `cacheLife` profile the underlying functions use — it is
 * documentation, not configuration, so if you change a profile in a service,
 * change it here too. It exists because "purge the cache" is a frightening
 * button to press without knowing what it reaches or how long the data would
 * have lived anyway.
 *
 * Deliberately excludes ORDERS and USERS: they are per-visitor and per-request,
 * nothing an admin needs to flush by hand, and offering a button implies
 * otherwise.
 */
export type CacheTagInfo = {
  tag: CacheTag;
  label: string;
  description: string;
  /** The cacheLife profile behind this tag, and how long an entry survives. */
  lifetime: string;
};

export const PURGEABLE_CACHE_TAGS: readonly CacheTagInfo[] = [
  {
    tag: CACHE_TAGS.PAGES,
    label: 'Content Pages',
    description:
      'The ~1,700 WordPress-authored pages served through the catch-all route, plus their Markdown views.',
    lifetime: 'days — refreshed daily, kept a week',
  },
  {
    tag: CACHE_TAGS.PRODUCTS,
    label: 'Products',
    description: 'Product detail pages, accessory and sale listings, and the sitemap’s product entries.',
    lifetime: 'hours — refreshed hourly, kept a day',
  },
  {
    tag: CACHE_TAGS.SEARCH,
    label: 'Search & Listings',
    description: 'Elasticsearch results behind the product listing page and its filters.',
    lifetime: 'minutes — refreshed every minute, kept an hour',
  },
  {
    tag: CACHE_TAGS.BLOG,
    label: 'Blog',
    description: 'The blog index and every article, from the backend blogs API.',
    lifetime: 'hours — refreshed hourly, kept a day',
  },
  {
    tag: CACHE_TAGS.SEO,
    label: 'SEO Overrides',
    description: 'Per-page titles, meta and scripts set in the Page Configurator.',
    lifetime: 'hours — refreshed hourly, kept a day',
  },
  {
    tag: CACHE_TAGS.CONTENT,
    label: 'On-Page Copy',
    description: 'Headings and visible copy set in the Content Editor.',
    lifetime: 'hours — refreshed hourly, kept a day',
  },
  {
    tag: CACHE_TAGS.HOMEPAGE,
    label: 'Homepage',
    description: 'Homepage-specific blocks.',
    lifetime: 'hours — refreshed hourly, kept a day',
  },
  {
    tag: CACHE_TAGS.SETTINGS,
    label: 'Store Settings',
    description:
      'The switches set from the admin screens: cart notice, product panel and chat regions. Saving a switch already refreshes it.',
    lifetime: 'hours — refreshed hourly, kept a day',
  },
  {
    tag: CACHE_TAGS.PRICING,
    label: 'Order Totals',
    description:
      'Delivery quotes and totals shown in the cart and checkout. Purge after changing prices or delivery rates. Place Order always re-prices fresh.',
    lifetime: '20 minutes',
  },
  {
    tag: CACHE_TAGS.AGENT_TRAFFIC,
    label: 'Agent Traffic Report',
    description: 'The crawler and MCP counts on the Agent Traffic screen. Past days are kept; today refreshes every few minutes.',
    lifetime: 'today: 5 minutes — past days: kept a week',
  },
  {
    tag: CACHE_TAGS.REVIEWS,
    label: 'Reviews',
    description: 'Product review lists and rating summaries.',
    lifetime: 'hours — refreshed hourly, kept a day',
  },
];

/**
 * The cache lifetime for a Redis-backed read that failed and fell back.
 *
 * Every cached Redis reader catches its own errors and returns a safe default
 * (no SEO override, the modal, strict chat regions). Caching that default for
 * the normal "hours" would keep serving it long after Redis came back, so a
 * failed read is cached only briefly instead: retried after a minute.
 *
 * The same holds for backend and Elasticsearch reads whose failure looks like
 * "not found" (WordPress pages, products, blog posts): cached for days or hours,
 * one blip would 404 a real page until the entry expired.
 *
 * Why not throw so the error is never cached: a cached function that throws
 * during a build fails that page's prerender even when the caller catches it,
 * so an outage would block every deploy. And `expire` stays at five minutes
 * because anything shorter turns the read into a dynamic hole, which would
 * change how the page prerenders.
 */
export const OUTAGE_CACHE_LIFE = { stale: 60, revalidate: 60, expire: 300 } as const;

/**
 * Outage lifetime for Redis reads rendered into every page — the root layout's
 * cart notice switch, page metadata, page copy, the product panel switch.
 *
 * A page's shell lives only as long as the shortest cache life inside it, so
 * OUTAGE_CACHE_LIFE there would regenerate every page shell each minute while
 * Redis is down, each regeneration waiting on Redis again. This retries every
 * 15 minutes instead. Saving a setting in the admin still busts its tag at once.
 */
export const SHELL_OUTAGE_CACHE_LIFE = { stale: 300, revalidate: 900, expire: 3600 } as const;
