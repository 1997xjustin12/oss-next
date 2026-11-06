import Image from 'next/image'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { LandingRichText } from '@/components/shared/LandingRichText'
import { FOR_SALE_TYPES } from '@/lib/data/forSaleContent'

/** "Shipping Container Types": the intro with its links, then a photo card per type. */
export function ForSaleTypes() {
  const { heading, intro, cards } = FOR_SALE_TYPES

  return (
    <section aria-labelledby="for-sale-types" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <h2 id="for-sale-types" className="font-anton text-3xl leading-tight tracking-wide text-theme-primary sm:text-4xl dark:text-red-400">
        {heading}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
        <LandingRichText content={intro} />
      </p>

      <ul className="mt-8 grid gap-6 sm:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label}>
            <Link
              href={card.href}
              className="group block overflow-hidden rounded-lg border-2 border-theme-border bg-white transition-colors hover:border-theme-primary
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="relative aspect-[367/426]">
                <Image src={card.image.src} alt={card.image.alt} fill sizes="(max-width: 640px) 90vw, 30vw" className="object-cover" />
              </div>
              <span className="block bg-theme-primary px-3 py-2.5 text-center text-sm font-bold text-white transition-colors group-hover:bg-theme-primary-dark">
                {card.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
