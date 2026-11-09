import { FeaturedContainerCard } from '@/components/product/FeaturedContainerCard'
import { AccentText } from '@/components/shared/AccentText'
import { PillLink } from '@/components/shared/PillLink'
import { locationListingHref } from '@/lib/locationPage'
import { getCachedDepotFeaturedContainers, type DepotFeaturedKey } from '@/services/search.service'
import type { LocationTemplateText } from '@/types/locationPage'
import type { ProductHit } from '@/types/product'

type Props = {
  text: LocationTemplateText['products']
  depot: string
  specs: readonly DepotFeaturedKey[]
}

/**
 * "Explore our top-selling shipping containers available in {city}": this
 * depot's own listings for the template's specs, rendered on the server (the
 * page is about this depot, whatever the visitor's saved location). A spec the
 * depot does not stock is left out; with none, the row is too.
 */
export async function LocationProducts({ text, depot, specs }: Props) {
  const containers = await getCachedDepotFeaturedContainers(depot, specs)

  return (
    <section aria-labelledby="location-products" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl text-center">
        <h2 id="location-products" className="text-3xl font-semibold leading-tight text-theme-dark sm:text-4xl dark:text-white">
          <AccentText text={text.heading} accentClassName="block text-theme-primary dark:text-red-400" />
        </h2>
        <p className="mt-3 text-base text-theme-mid sm:text-lg dark:text-neutral-300">{text.intro}</p>
      </div>

      {containers.length > 0 && (
        <ul className="mt-8 grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {containers.map(({ spec, product }) => (
            <li key={spec.key} className="flex">
              {/* The formatted search hit is the shape the card reads; the API route
                  hands the client the same object typed this way. */}
              <FeaturedContainerCard product={product as unknown as ProductHit} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 text-center">
        <PillLink href={locationListingHref(depot)}>{text.cta}</PillLink>
      </div>
    </section>
  )
}
