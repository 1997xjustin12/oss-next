/**
 * The native /all-city/ pages, by slug.
 *
 * A plain list with no imports, so config/routes.ts can claim these paths
 * without loading the records (which reach config/routes through their content
 * and would make a cycle). A unit test keeps it equal to lib/data/allCityPages.ts.
 */
export const ALL_CITY_PAGE_SLUGS: readonly string[] = [
  'storage-units-cocoa-beach-fl',
  'abbeville-storage-unit',
  'abbott-shipping-containers',
  'acme-storage-container',
]
