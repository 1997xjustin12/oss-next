export const CACHE_TAGS = {
  /** Global tag — revalidating this single tag busts the entire store cache. */
  ALL:        'store',
  PRODUCTS:   'products',
  SEARCH:     'search',   // Elasticsearch PLP results
  CATEGORIES: 'categories',
  HOMEPAGE:   'homepage',
  PAGES:      'pages',    // Converted WordPress pages from the Django pages API
  BLOG:       'blog',     // Headless WordPress blog posts (bbq-blog REST API)
  ORDERS:     'orders',
  USERS:      'users',
  REVIEWS:    'reviews',
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
