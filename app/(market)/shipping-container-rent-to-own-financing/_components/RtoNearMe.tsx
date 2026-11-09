import Image from 'next/image'
import { Stars } from '@/components/product/Stars'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { ROUTES } from '@/config/routes'
import { cheapestMatch, type ConfiguratorProduct } from '@/lib/configurator'
import { RTO_CONFIGURATOR, RTO_NEAR_ME } from '@/lib/data/rentToOwnContent'
import { SnapCarousel } from '@/components/shared/SnapCarousel'

type Props = {
  /** The generic listing's rent-to-own products, which the page has already read. */
  products: readonly ConfiguratorProduct[]
}

const SPEC_KEYS = ['size', 'condition', 'grade', 'term']

/**
 * "Rent-To-Own Shipping Containers Near Me": a card per container on WordPress's
 * list, without a price as there. A container the catalogue no longer has is left
 * out, and a failed search leaves out the whole section rather than show its
 * heading over nothing.
 */
export function RtoNearMe({ products }: Props) {
  const { heading, intro, term, items } = RTO_NEAR_ME

  const cards = items.flatMap((item) => {
    const { size, condition, grade } = item
    const product = cheapestMatch(products, { size, condition, grade, term }, SPEC_KEYS)
    return product?.handle ? [{ name: item.name, product }] : []
  })

  if (cards.length === 0) return null

  return (
    <section aria-labelledby="rto-near-me" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <h2 id="rto-near-me" className="text-center text-3xl font-extrabold leading-tight text-theme-dark sm:text-4xl dark:text-white">
        <span className="text-theme-primary dark:text-red-400">{heading.accent}</span> {heading.rest}{' '}
        <span className="text-theme-primary dark:text-red-400">{heading.accentEnd}</span>
      </h2>
      <p className="mx-auto mt-4 max-w-4xl text-center text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
        {intro}
      </p>

      <SnapCarousel label="Rent-to-own shipping containers">
        {cards.map(({ name, product }) => {
          const rating = product.rating.value > 0 ? product.rating.value : RTO_CONFIGURATOR.fallbackRating
          return (
            <li
              key={product.id}
              className="flex w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]"
            >
              <Link
                href={ROUTES.PRODUCT(product.handle)}
                className="group flex w-full flex-col overflow-hidden rounded-lg border-2 border-theme-border bg-white shadow-sm transition-[border-color,box-shadow] duration-300
                           hover:border-theme-primary hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary
                           dark:border-neutral-800 dark:bg-neutral-900"
              >
                <p className="bg-theme-primary py-2 text-center text-xs font-extrabold uppercase tracking-wider text-white">
                  Bestseller
                </p>
                <div className="flex flex-1 flex-col items-center gap-3 p-4">
                  <h3 className="line-clamp-3 min-h-[3.75rem] text-center text-sm font-bold leading-snug text-[#0F3A59] dark:text-neutral-100">
                    {name}
                  </h3>
                  <span className="relative block aspect-4/3 w-full overflow-hidden rounded-md">
                    {product.images[0] && (
                      <Image
                        src={product.images[0]}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, (max-width: 1280px) 30vw, 22vw"
                        className="object-contain"
                      />
                    )}
                  </span>
                  <span className="mt-auto flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-theme-dark dark:text-neutral-100">{rating.toFixed(1)}</span>
                    <Stars count={Math.round(rating)} className="h-3.5 w-3.5" />
                    <span className="sr-only">out of 5 stars</span>
                  </span>
                  <span className="rounded-sm bg-theme-primary px-5 py-2 text-xs font-bold uppercase text-white transition-colors group-hover:bg-theme-primary-dark sm:text-sm">
                    View Container
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </SnapCarousel>
    </section>
  )
}
