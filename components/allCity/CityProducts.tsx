import { FeaturedContainerCard } from '@/components/product/FeaturedContainerCard'
import { PillLink } from '@/components/shared/PillLink'
import { getCachedDepotFeaturedContainers, type DepotFeaturedKey } from '@/services/search.service'
import type { ProductHit } from '@/types/product'

type Props = {
  /** The page's h1, which WordPress placed over the product cards. */
  heading: string
  depot: string
  specs: readonly DepotFeaturedKey[]
  seeMore: { label: string; href: string }
}

/**
 * The page's heading over WordPress's four product cards for the page's depot,
 * then "SEE MORE" to the depot's page. Rendered on the server from the cached
 * depot lookup, as on the location pages: the page is about this depot,
 * whatever the visitor's saved location. A spec the depot no longer stocks is
 * left out; with none, the row is too and the heading stands alone.
 */
export async function CityProducts({ heading, depot, specs, seeMore }: Props) {
  const containers = await getCachedDepotFeaturedContainers(depot, specs)

  return (
    <section aria-labelledby="city-products" className="bg-white px-[5%] py-10 sm:py-12 dark:bg-neutral-950">
      <h1 id="city-products" className="text-xl font-bold text-theme-primary sm:text-2xl dark:text-red-400">
        {heading}
      </h1>

      {containers.length > 0 && (
        <ul className="mt-6 grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {containers.map(({ spec, product }) => (
            <li key={spec.key} className="flex">
              {/* The formatted search hit is the shape the card reads (as LocationProducts). */}
              <FeaturedContainerCard product={product as unknown as ProductHit} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 text-center">
        <PillLink href={seeMore.href}>{seeMore.label}</PillLink>
      </div>
    </section>
  )
}
