import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from '@/config/cache'
import { conditionSlug, gradeSlug, sizeSlug } from '@/lib/containerSpecTerms'
import { resolveContainerVariant } from '@/lib/containerVariant'
import { resolveCondition, resolveGrade } from '@/lib/containerOverview'
import { getContainerImages } from '@/lib/containerImages'
import { getContainerVideo } from '@/lib/containerVideo'
import { getCustomFieldValue, isInStockHit } from '@/lib/pricing'
import { normaliseRating } from '@/lib/ratings'
import { getShippingContainersByLocation } from '@/services/search.service'
import type { ConfiguratorPaymentType, ConfiguratorProduct } from '@/lib/configurator'
import type { FormattedContainerHit, ProductHit } from '@/types/product'

function toConfiguratorProduct(hit: FormattedContainerHit): ConfiguratorProduct {
  const product = hit as unknown as ProductHit
  // Curated photographs replace the record's own, as on the product page.
  const curated = getContainerImages(product)
  const images = curated.length > 0 ? curated : (product.images ?? []).map((img) => img.src).filter(Boolean)
  const rating = normaliseRating(product.ratings)

  return {
    id: product.objectID,
    title: product.title,
    price: product.sale_price,
    sku: product.variants?.[0]?.sku ?? '',
    location: getCustomFieldValue(hit, 'location'),
    specs: {
      size: sizeSlug(resolveContainerVariant(product)),
      condition: conditionSlug(resolveCondition(product)),
      grade: gradeSlug(resolveGrade(product)),
      // Stored as a list literal, "['48']".
      term: getCustomFieldValue(hit, 'payment_term').match(/\d+/)?.[0] ?? '',
    },
    sizeLabel: getCustomFieldValue(hit, 'length_width'),
    conditionLabel: getCustomFieldValue(hit, 'condition'),
    images,
    video: getContainerVideo(product),
    rating: { value: rating.value, count: rating.count },
  }
}

/**
 * A depot's containers of one payment type, ready for the configurator.
 *
 * The depot listing is about 260 KB (every container for sale, rent and
 * rent-to-own, with descriptions and metadata); this is the 48 or so the
 * configurator can offer, at a few hundred bytes each. Out-of-stock and
 * unpriced listings are left out, so their options show as unavailable.
 *
 * Throws when the search does: a failure is not cached as an empty depot.
 */
export async function getConfiguratorProducts(
  location: string,
  paymentType: ConfiguratorPaymentType,
): Promise<ConfiguratorProduct[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag(CACHE_TAGS.ALL, CACHE_TAGS.PRODUCTS)

  const hits = await getShippingContainersByLocation(location)
  return hits
    .filter((hit) => getCustomFieldValue(hit, 'payment_type') === paymentType)
    .filter((hit) => hit.sale_price > 0 && isInStockHit(hit))
    .map(toConfiguratorProduct)
}
