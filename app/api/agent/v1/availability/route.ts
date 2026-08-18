import { getProductByHandle, getShippingContainersByLocation } from '@/services/search.service'
import { findEquivalentContainer, isContainerHit } from '@/lib/pricing'
import { findNearestLocation } from '@/lib/locations'
import { lookupZipGeo } from '@/lib/zippopotam'
import { agentError, agentJson, withRateLimit } from '@/lib/agentApi'
import { toAgentProduct } from '@/lib/agentProduct'
import { SITE } from '@/config/site'
import type { ProductHit } from '@/types/product'

/**
 * GET /api/agent/v1/availability?zip=90210[&handle=…]
 *
 * The one question about this business that a catalog dump cannot answer:
 * *can you actually deliver to me, and from where.*
 *
 * Containers are shipped by truck from a depot network, so availability is a
 * property of the customer's location rather than of the product. Without this
 * endpoint an agent can read every price on the site and still recommend a
 * container that is stocked 900km from the customer.
 *
 * With `handle`: does that exact container exist at the nearest depot, and if
 * not, is an equivalent one there? The catalog models one physical container as
 * many per-depot documents, so "the same container, at your depot" is a real
 * lookup rather than a fallback.
 *
 * Without `handle`: what is the nearest depot and what does it stock.
 */

/** Beyond this the depot is real but the delivery quote will be unusual. */
const LONG_HAUL_KM = 400
const KM_PER_MILE = 1.609344
const MAX_LISTED = 20

export async function GET(request: Request) {
  return withRateLimit(request, async (headers) => {
    const params = new URL(request.url).searchParams
    const zip = params.get('zip')?.trim()
    const handle = params.get('handle')?.trim()

    if (!zip) {
      return agentError(
        'missing_zip',
        'A zip parameter is required.',
        400,
        'Pass a US ZIP (90210) or a Canadian postal code (T2P 1J9).',
        headers,
      )
    }

    const geo = await lookupZipGeo(zip)
    if (!geo) {
      return agentError(
        'unknown_zip',
        `Could not resolve "${zip}" to a location.`,
        404,
        'Use a 5-digit US ZIP or a Canadian postal code. Only the US and Canada are served.',
        headers,
      )
    }

    const nearest = findNearestLocation(geo.latitude, geo.longitude)
    if (!nearest) {
      return agentError('no_depot', 'No depot data is available.', 503, undefined, headers)
    }

    const distanceMiles = Math.round(nearest.distanceKm / KM_PER_MILE)
    const destination = {
      zip,
      city: geo.city,
      state: geo.state,
      country: geo.countryCode,
    }
    const depot = {
      name: nearest.title,
      distanceMiles,
      longHaul: nearest.distanceKm > LONG_HAUL_KM,
    }

    let stock: ProductHit[]
    try {
      stock = (await getShippingContainersByLocation(nearest.title)) as ProductHit[]
    } catch (err) {
      console.error('[agent-api] availability stock lookup failed:', err)
      return agentError('availability_unavailable', 'Availability lookup is temporarily unavailable.', 503, 'Retry shortly.', headers)
    }

    const deliveryNote = depot.longHaul
      ? `The nearest depot is about ${distanceMiles} miles away, which is further than a routine delivery. Call ${SITE.telephoneDisplay} for a delivered price before quoting one.`
      : `Delivery is typically 3-5 days after a 1-2 day handling window. The site needs about 12ft of width for truck access and clear space to manoeuvre.`

    // ── No handle: describe the depot and what it stocks ────────────────────
    if (!handle) {
      return agentJson(
        {
          destination,
          depot,
          deliverable: true,
          deliveryNote,
          stockCount: stock.length,
          sampleProducts: stock.slice(0, MAX_LISTED).map((p) => toAgentProduct(p)),
          priceNote:
            'Rental and rent-to-own products are priced PER MONTH. Read price.description before quoting any figure.',
        },
        { cacheSeconds: 600, extraHeaders: headers },
      )
    }

    // ── With handle: is this specific container servable from there? ────────
    let result
    try {
      result = await getProductByHandle(handle)
    } catch (err) {
      console.error('[agent-api] availability product lookup failed:', err)
      return agentError('availability_unavailable', 'Product lookup is temporarily unavailable.', 503, 'Retry shortly.', headers)
    }

    if (!result) {
      return agentError(
        'not_found',
        `No product with handle "${handle}".`,
        404,
        'Handles come from /api/agent/v1/search.',
        headers,
      )
    }

    const product = result.product as ProductHit

    // Accessories ship rather than being trucked from a depot, so depot
    // proximity is irrelevant to them — saying otherwise would be wrong.
    if (!isContainerHit(product)) {
      return agentJson(
        {
          destination,
          depot,
          requested: toAgentProduct(product),
          deliverable: true,
          matchType: 'shipped_item',
          deliveryNote: 'Accessories ship by parcel carrier nationwide and are not tied to a depot.',
        },
        { cacheSeconds: 600, extraHeaders: headers },
      )
    }

    const exact = stock.find((hit) => hit.handle === product.handle)
    const equivalent = exact ? undefined : findEquivalentContainer(stock, product)
    const match = exact ?? equivalent

    return agentJson(
      {
        destination,
        depot,
        requested: toAgentProduct(product),
        deliverable: Boolean(match),
        matchType: exact ? 'exact' : equivalent ? 'equivalent_at_depot' : 'none',
        ...(match ? { availableListing: toAgentProduct(match) } : {}),
        deliveryNote: match
          ? deliveryNote
          : `This container is not stocked at ${nearest.title}. Call ${SITE.telephoneDisplay} — it can usually be moved between depots, but the delivered price will differ.`,
        matchNote:
          'The catalog lists the same physical container once per depot. An "equivalent_at_depot" match is the same specification stocked locally, and is the listing to quote — its price and handle differ from the one requested.',
        priceNote:
          'Rental and rent-to-own products are priced PER MONTH. Read price.description before quoting any figure.',
      },
      { cacheSeconds: 600, extraHeaders: headers },
    )
  })
}
