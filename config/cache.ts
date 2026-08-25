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
    label: 'Content pages',
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
    label: 'Search & listings',
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
    label: 'SEO overrides',
    description: 'Per-page titles, meta and scripts set in the Page Configurator.',
    lifetime: 'hours — refreshed hourly, kept a day',
  },
  {
    tag: CACHE_TAGS.CONTENT,
    label: 'On-page copy',
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
    tag: CACHE_TAGS.REVIEWS,
    label: 'Reviews',
    description: 'Product review lists and rating summaries.',
    lifetime: 'hours — refreshed hourly, kept a day',
  },
];
