import Image from 'next/image'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { CARGO_SIZES } from '@/lib/data/cargoWorthyContent'

const LINK = 'underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary'

/** The three sizes, each a photo beside its linked title and copy, under the "available sizes" band. */
export function CargoSizes() {
  return (
    <section aria-label="Available sizes" className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
      <ul className="space-y-10">
        {CARGO_SIZES.map((size) => (
          <li key={size.title}>
            <article className="grid items-center gap-6 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-10">
              <div className="overflow-hidden rounded-xl bg-theme-subtle ring-1 ring-theme-border dark:bg-neutral-800 dark:ring-neutral-800">
                <Image src={size.image.src} alt={size.image.alt} width={size.image.width} height={size.image.height} sizes="(max-width: 768px) 90vw, 320px" className="h-auto w-full" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-extrabold text-theme-dark sm:text-2xl dark:text-white">
                  <Link href={size.href} className={`hover:text-theme-primary dark:hover:text-red-400 ${LINK}`}>
                    {size.title}
                  </Link>
                </h3>
                <p className="mt-3 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
                  <Link href={size.href} className={`font-extrabold text-theme-primary underline dark:text-red-400 ${LINK}`}>
                    {size.lead}
                  </Link>
                  {size.rest}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
