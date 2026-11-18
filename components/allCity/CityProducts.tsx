import { ContainerCard } from '@/components/product/ContainerCard'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { PlpLink } from '@/components/shared/PlpLink'
import { TemplateRichText } from '@/components/shared/TemplateRichText'
import { FEATURED_CONTAINERS, type FeaturedContainer } from '@/config/featuredContainers'
import { ROUTES } from '@/config/routes'
import { toFeaturedCards } from '@/lib/featuredCards'
import { DEPOT_FEATURED_SPECS, getCachedDepotFeaturedContainers, type DepotFeaturedKey } from '@/services/search.service'
import type { AllCityProductCard, AllCityProductsText } from '@/types/allCity'

type Props = {
  /** The section's wording, filled (the template's `sections.products`). */
  text: AllCityProductsText
  /** The page's depot, as the catalogue names it: whose listings price the cards. */
  depot: string
}

/** A card's photo when its listing has none: the homepage card's for that listing, else one of the same size. */
function fallbackImage(key: DepotFeaturedKey): string {
  const own = FEATURED_CONTAINERS.find((item) => item.depotSpec === key)
  if (own) return own.image
  const spec = DEPOT_FEATURED_SPECS.find((s) => s.key === key)
  if (spec?.size === '20') return '/images/containers/used-20ft-standard.webp'
  return spec?.height === 'High Cube' ? '/images/containers/used-40ft-hc.webp' : '/images/containers/used-40ft-standard.webp'
}

/** The homepage card's item for one of this section's cards: its words, and the listing filter its link opens. */
function cardItem(card: AllCityProductCard): FeaturedContainer {
  const spec = DEPOT_FEATURED_SPECS.find((s) => s.key === card.spec)
  return {
    key: card.spec,
    image: fallbackImage(card.spec),
    type: card.title,
    desc: card.description,
    ctaLabel: card.button,
    depotSpec: card.spec,
    spec: {
      paymentType: 'buy',
      size: spec ? `${spec.size}'` : undefined,
      height: spec ? (spec.height === 'High Cube' ? 'high-cube' : 'standard') : undefined,
      condition: spec?.condition,
    },
  }
}

const BUTTON =
  'block w-full bg-theme-primary px-6 py-3 text-center text-lg font-bold sm:inline-block sm:w-auto text-white shadow-md transition-colors hover:bg-theme-primary-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-theme-primary sm:text-xl'

/**
 * "Find The Right Shipping Container In <city>" (the 2026-11-18 design): the
 * homepage's container cards, priced and pictured from the page's depot on the
 * server (the page is about that depot, whatever the visitor's saved
 * location). A card whose listing the depot does not have is left out. The
 * row swipes on a phone (CSS scroll snap, no script) and is a grid from `sm`.
 */
export async function CityProducts({ text, depot }: Props) {
  const found = toFeaturedCards(await getCachedDepotFeaturedContainers(depot, text.cards.map((card) => card.spec)))
  const cards = text.cards.filter((card) => found[card.spec])

  return (
    <section aria-labelledby="city-products" className="bg-white px-[5%] py-10 sm:py-14 dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl text-center">
        <h2 id="city-products" className="text-2xl leading-tight font-bold text-balance text-neutral-900 sm:text-3xl lg:text-[34px] dark:text-white">
          <TemplateRichText
            text={text.heading}
            accentClassName="text-theme-primary dark:text-red-400"
            linkClassName="text-theme-primary underline underline-offset-4 hover:no-underline dark:text-red-400"
          />
        </h2>
        {text.body.trim() && (
          <p className="mt-3 text-base leading-relaxed text-neutral-700 sm:text-xl dark:text-neutral-300">
            <TemplateRichText text={text.body} accentClassName="font-bold text-neutral-900 dark:text-white" />
          </p>
        )}
      </div>

      {cards.length > 0 && (
        <ul
          aria-label="Shipping containers"
          className="-mx-[5vw] mt-8 flex snap-x snap-mandatory scroll-px-[5vw] gap-4 overflow-x-auto px-[5vw] py-2 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:snap-none lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr lg:gap-8"
        >
          {cards.map((card) => {
            const item = cardItem(card)
            const listing = found[card.spec]
            return (
              <li key={card.spec} className="w-[78%] shrink-0 snap-start sm:w-auto sm:shrink">
                <ContainerCard item={item} image={listing.image || item.image} price={listing.price} pricePending={false} />
              </li>
            )
          })}
        </ul>
      )}

      {text.button.trim() && (
        <div className="mt-8 text-center sm:mt-10">
          {text.buttonHref.startsWith(ROUTES.PLP) ? (
            <PlpLink prefetch={false} href={text.buttonHref} className={BUTTON}>
              {text.button}
            </PlpLink>
          ) : (
            <Link href={text.buttonHref} className={BUTTON}>
              {text.button}
            </Link>
          )}
          {text.note.trim() && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{text.note}</p>}
        </div>
      )}
    </section>
  )
}
