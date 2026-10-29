import Image from 'next/image'
import { Check } from 'lucide-react'
import { AccentText } from '@/components/shared/AccentText'
import { GBP_PRODUCT_CARDS } from '@/lib/data/gbpShared'
import { GbpCallButton } from './GbpCallButton'
import { GBP_ACCENT, GBP_CONTAINER, GBP_H2 } from './gbpStyles'

type Props = { heading: string; phone: string; telHref: string }

/** Rent / Buy / Rent-To-Own: three cards, each ending in the page's call button. */
export function GbpProducts({ heading, phone, telHref }: Props) {
  return (
    <section aria-labelledby="gbp-products" className="bg-white py-10 sm:py-12 dark:bg-neutral-950">
      <div className={GBP_CONTAINER}>
        <h2 id="gbp-products" className={GBP_H2}>
          <AccentText text={heading} accentClassName={GBP_ACCENT} />
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {GBP_PRODUCT_CARDS.map((card) => (
            <li
              key={card.title}
              className="flex flex-col items-center rounded-md border border-red-100 bg-white px-6 pb-7 pt-5 text-center shadow-[0_0_10px_rgba(198,12,41,0.25)]
                         dark:border-red-950 dark:bg-neutral-900"
            >
              <Image
                src={card.image.src}
                alt={card.image.alt}
                width={card.image.width}
                height={card.image.height}
                sizes="(max-width: 768px) 90vw, 400px"
                // White behind it in dark mode: "RENT"'s letters are cut out of the image.
                className="h-auto w-full max-w-sm dark:rounded-md dark:bg-white dark:p-2"
              />
              <h3 className="mt-4 text-xl font-semibold text-black dark:text-white">{card.title}</h3>
              <ul className="mt-3 space-y-1 text-[15px] text-black dark:text-neutral-200">
                {card.features.map((feature) => (
                  <li key={feature} className="flex items-center justify-center gap-2">
                    <Check aria-hidden className="h-4 w-4 shrink-0" strokeWidth={3} />
                    {feature}
                  </li>
                ))}
              </ul>
              <GbpCallButton phone={phone} telHref={telHref} className="mt-6 min-w-44 text-lg" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
