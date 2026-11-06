import Image from 'next/image'
import { PillLink } from '@/components/shared/PillLink'
import { RENTAL_FINANCING } from '@/lib/data/rentalContent'

const H3 = 'font-anton text-2xl leading-tight tracking-wide text-theme-primary sm:text-3xl dark:text-red-400'
const BODY = 'mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300'

/** "Shipping Container Financing Options": rent-to-own, then TimePayment's lease-to-purchase. */
export function RentalFinancing() {
  const { heading, rentToOwn, lease } = RENTAL_FINANCING

  return (
    <section aria-labelledby="rental-financing" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <h2 id="rental-financing" className="text-center font-anton text-3xl leading-tight tracking-wide text-theme-primary sm:text-4xl dark:text-red-400">
        {heading}
      </h2>

      <div className="mt-10 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <Image
          src={rentToOwn.image.src}
          alt={rentToOwn.image.alt}
          width={rentToOwn.image.width}
          height={rentToOwn.image.height}
          sizes="(max-width: 1024px) 90vw, 45vw"
          className="h-auto w-full rounded-lg"
        />
        <div>
          <h3 className={H3}>{rentToOwn.heading}</h3>
          <p className={BODY}>{rentToOwn.body}</p>
          <PillLink href={rentToOwn.href} className="mt-6">
            {rentToOwn.cta}
          </PillLink>
        </div>
      </div>

      <div className="mt-12 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="order-2 lg:order-1">
          <h3 className={H3}>{lease.heading}</h3>
          <p className={BODY}>{lease.body}</p>
          <PillLink href={lease.href} className="mt-6">
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
