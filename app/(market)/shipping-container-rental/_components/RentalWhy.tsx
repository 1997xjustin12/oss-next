import Image from 'next/image'
import { RENTAL_WHY } from '@/lib/data/rentalContent'

/** "Why Should I Rent A Shipping Container?": the uses, the benefits and why rent first. */
export function RentalWhy() {
  const { heading, lead, benefitsHeading, benefits, body, image } = RENTAL_WHY

  return (
    <section aria-labelledby="rental-why" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(max-width: 1024px) 90vw, 45vw"
          className="h-auto w-full rounded-lg"
        />
        <div>
          <h2 id="rental-why" className="font-anton text-3xl leading-tight tracking-wide text-theme-primary sm:text-4xl dark:text-red-400">
            {heading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{lead}</p>
          <p className="mt-4 font-bold text-theme-dark dark:text-white">{benefitsHeading}</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-base text-theme-dark sm:text-lg dark:text-neutral-200">
            {benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
          <p className="mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">{body}</p>
        </div>
      </div>
    </section>
  )
}
