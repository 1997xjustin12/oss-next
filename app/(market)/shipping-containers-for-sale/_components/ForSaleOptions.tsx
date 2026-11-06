import Image from 'next/image'
import { LandingRichText } from '@/components/shared/LandingRichText'
import { PillLink } from '@/components/shared/PillLink'
import { FOR_SALE_LINKS, FOR_SALE_OPTIONS } from '@/lib/data/forSaleContent'

const H3 = 'font-anton text-2xl leading-tight tracking-wide text-theme-primary sm:text-3xl dark:text-red-400'
const BODY = 'text-base leading-relaxed text-theme-mid dark:text-neutral-300'

/** "We Also Have Shipping Container Rental And Financing Options": renting, then lease-to-purchase. */
export function ForSaleOptions() {
  const { heading, intro, rental, lease } = FOR_SALE_OPTIONS

  return (
    <section aria-labelledby="for-sale-options" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <h2 id="for-sale-options" className="font-anton text-3xl leading-tight tracking-wide text-theme-primary sm:text-4xl dark:text-red-400">
        {heading}
      </h2>
      <p className={`mt-4 sm:text-lg ${BODY}`}>{intro}</p>

      <div className="mt-10 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <Image
          src={rental.image.src}
          alt={rental.image.alt}
          width={rental.image.width}
          height={rental.image.height}
          sizes="(max-width: 1024px) 90vw, 45vw"
          className="h-auto w-full rounded-lg"
        />
        <div>
          <h3 className={H3}>{rental.heading}</h3>
          <p className={`mt-4 ${BODY}`}>{rental.lead}</p>
          <p className={`mt-3 ${BODY}`}>
            <LandingRichText content={rental.body} />
          </p>
          <PillLink href={FOR_SALE_LINKS.rental} className="mt-6">
            {rental.cta}
          </PillLink>
        </div>
      </div>

      <div className="mt-12 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="order-2 lg:order-1">
          <h3 className={H3}>{lease.heading}</h3>
          {lease.paragraphs.map((paragraph, i) => (
            <p key={i} className={`mt-3 first-of-type:mt-4 ${BODY}`}>
              <LandingRichText content={paragraph} />
            </p>
          ))}
          <PillLink href={FOR_SALE_LINKS.rentToOwn} className="mt-6">
            {lease.cta}
          </PillLink>
        </div>
        <Image
          src={lease.image.src}
          alt={lease.image.alt}
          width={lease.image.width}
          height={lease.image.height}
          sizes="(max-width: 1024px) 90vw, 45vw"
          className="order-1 h-auto w-full rounded-lg lg:order-2"
        />
      </div>
    </section>
  )
}
