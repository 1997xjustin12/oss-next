import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { PROMO_HEADING, PROMO_LINKS, PROMO_RENTAL_DEALS } from '@/lib/data/specialPromotionsContent'

/** The red "on sale" band: three photos beside the rental deals. */
export function PromoRentalDeals() {
  const { images, deals, question, cta } = PROMO_RENTAL_DEALS

  return (
    <>
      <SectionTagline2 text={PROMO_HEADING} />
      <section aria-label="Rental deals" className="bg-theme-primary px-[5%] pb-12 pt-4 text-white sm:pb-16">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
          <ul className="grid grid-cols-3 gap-3 sm:gap-5">
            {images.map((image) => (
              <li key={image.src} className="overflow-hidden rounded-lg shadow-lg">
                <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 1024px) 30vw, 18vw" className="h-auto w-full" />
              </li>
            ))}
          </ul>
          <div>
            <ul className="list-disc space-y-3 pl-6 text-lg leading-snug sm:text-xl">
              {deals.map((deal) => (
                <li key={deal.strong}>
                  <strong className="font-extrabold">{deal.strong}</strong>
                  {deal.rest}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xl font-bold">{question}</p>
            <Link
              href={PROMO_LINKS.rental}
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#0F3A59] px-8 text-lg font-extrabold text-[#FBEE45] transition-colors hover:bg-[#0b2c44]
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {cta}
              <ArrowRight aria-hidden className="h-5 w-5" />
              <span className="sr-only">: container rentals</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
