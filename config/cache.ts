export const CACHE_TAGS = {
  /** Global tag — revalidating this single tag busts the entire store cache. */
  ALL: 'store',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  HOMEPAGE: 'homepage',
  ORDERS: 'orders',
  USERS: 'users',
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
