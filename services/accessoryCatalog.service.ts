import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { ACCESSORY_CATALOG_DEMO } from '@/lib/data/accessoryCatalogDemo'
import type { AccessoryListing } from '@/types/accessoryCatalog'

/**
 * Every product shown on /shipping-container-accessory-products.
 *
 * Returns the placeholder catalogue for now. When the real accessories are
 * wired in (the Elasticsearch accessory products), only this function changes:
 * map them to `AccessoryListing` here, keep the cache directive, and on a
 * failed read cache briefly with OUTAGE_CACHE_LIFE rather than as "no products"
 * (see services/search.service.ts).
 */
export async function getAccessoryCatalog(): Promise<AccessoryListing[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)
  return ACCESSORY_CATALOG_DEMO
}
