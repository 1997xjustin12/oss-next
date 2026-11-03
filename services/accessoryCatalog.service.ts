import { ALL_RESULTS_CAP, cachedEsSearch, DEFAULT_LOCATION } from '@/services/search.service'
import { ACCESSORY_HITS_PER_PAGE } from '@/lib/accessoryCatalog'
import { pickCartUpsell } from '@/lib/cartUpsell'
import type { ProductHit } from '@/types/product'

/** The accessories, cached by cachedEsSearch ('minutes'). */
async function searchAccessories(hitsPerPage: number): Promise<ProductHit[]> {
  const { hits } = await cachedEsSearch({
    query: '',
    hitsPerPage,
    page: 0,
    facets: [],
    facetFilters: [],
    productType: 'accessories',
    locationFilter: DEFAULT_LOCATION,
    sortParam: 'default',
    accessoryCategory: undefined,
    sizeFilter: [],
    conditionFilter: [],
    gradeFilter: [],
    heightFilter: [],
    containerTypeFilter: [],
    termFilter: [],
  })
  return hits as unknown as ProductHit[]
}

/**
 * The accessories page's first page of products, server-side.
 *
 * The visible grid is InstantSearch in the browser; this gives the server HTML
 * the same products for the ItemList structured data and the no-JavaScript
 * list, so crawlers see the catalogue without running the search. A failed
 * search yields an empty list: the page still renders, and the browser search
 * shows its own notice.
 */
export async function getAccessoryHighlights(): Promise<ProductHit[]> {
  try {
    return await searchAccessories(ACCESSORY_HITS_PER_PAGE)
  } catch (err) {
    console.error('[accessories] server product list failed:', err)
    return []
  }
}

/**
 * The Added to Cart dialog's accessories (config/cartUpsell.ts). A failed search
 * yields an empty list, and the dialog leaves the row out.
 */
export async function getCartUpsellAccessories(): Promise<ProductHit[]> {
  try {
    return pickCartUpsell(await searchAccessories(ALL_RESULTS_CAP))
  } catch (err) {
    console.error('[accessories] cart upsell failed:', err)
    return []
  }
}
