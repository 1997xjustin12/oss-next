import { cachedEsSearch, DEFAULT_LOCATION } from '@/services/search.service'
import { ACCESSORY_HITS_PER_PAGE } from '@/lib/accessoryCatalog'
import type { ProductHit } from '@/types/product'

/**
 * The accessories page's first page of products, server-side.
 *
 * The visible grid is InstantSearch in the browser; this gives the server HTML
 * the same products for the ItemList structured data and the no-JavaScript
 * list, so crawlers see the catalogue without running the search. Cached by
 * cachedEsSearch ('minutes'). A failed search yields an empty list: the page
 * still renders, and the browser search shows its own notice.
 */
export async function getAccessoryHighlights(): Promise<ProductHit[]> {
  try {
    const { hits } = await cachedEsSearch({
      query: '',
      hitsPerPage: ACCESSORY_HITS_PER_PAGE,
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
  } catch (err) {
    console.error('[accessories] server product list failed:', err)
    return []
  }
}
