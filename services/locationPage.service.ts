import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { getLocationPageSeed } from '@/lib/data/locationPages'
import { LOCATION_TEMPLATE_DEFAULT } from '@/lib/data/locationTemplate'
import type { LocationPage, LocationTemplate } from '@/types/locationPage'

/**
 * The location pages' records: the template and one record per native
 * location. For now these are the code seeds; the configurator (phase 2 in
 * docs/reference/location-pages.md) moves them to Redis with drafts and
 * publishing, as services/gbp.service.ts does for the GBP pages, behind these
 * same functions and tags.
 */

export function locationPageTag(slug: string): string {
  return `location-page:${slug}`
}

/** A native location's record. Null when the slug has none (WordPress still serves it). */
export async function getLocationPage(slug: string): Promise<LocationPage | null> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.LOCATION_PAGES, locationPageTag(slug))
  return getLocationPageSeed(slug) ?? null
}

export async function getLocationTemplate(): Promise<LocationTemplate> {
  'use cache'
  cacheLife('hours')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.LOCATION_PAGES)
  return LOCATION_TEMPLATE_DEFAULT
}
