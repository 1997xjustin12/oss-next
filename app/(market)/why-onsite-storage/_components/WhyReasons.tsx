import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { WHY_NEAR_ME, WHY_PRICES, WHY_SATISFACTION, WHY_STAFF } from '@/lib/data/whyOnsiteContent'
import { WhyRichText } from './WhyRichText'

const BLUE = 'bg-[#0F3A59] px-[5%] py-12 text-white sm:py-16'
const WHITE = 'bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950'
const H2_DARK = 'text-2xl font-extrabold leading-tight sm:text-3xl'
const H2_LIGHT = 'text-2xl font-extrabold leading-tight text-theme-dark sm:text-3xl dark:text-white'
const BODY_DARK = 'mt-4 text-base leading-relaxed text-white/90 sm:text-lg'
const BODY_LIGHT = 'mt-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300'

/**
 * The four reasons under the red band, in WordPress's order and on its
 * alternating blue and white: experienced staff, the satisfaction guarantee,
 * the depot network and the price guarantee.
 */
export function WhyReasons() {
  return (
    <>
      <section aria-labelledby="why-staff" className={BLUE}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 id="why-staff" className={H2_DARK}>{WHY_STAFF.heading}</h2>
          <p className={BODY_DARK}>{WHY_STAFF.body}</p>
        </div>
      </section>

      <section aria-labelledby="why-satisfaction" className={WHITE}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <ul className="order-2 grid grid-cols-2 gap-4 lg:order-1">
            {WHY_SATISFACTION.images.map((img) => (
              <li key={img.src} className="overflow-hidden rounded-xl shadow-sm">
                <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(max-width: 1024px) 45vw, 22vw" className="h-auto w-full" />
              </li>
            ))}
          </ul>
          <div className="order-1 min-w-0 lg:order-2">
            <h2 id="why-satisfaction" className={H2_LIGHT}>
              <Link href={WHY_SATISFACTION.heading.href} className="hover:text-theme-primary dark:hover:text-red-400">
                {WHY_SATISFACTION.heading.text}
              </Link>
            </h2>
            <p className={BODY_LIGHT}>{WHY_SATISFACTION.body}</p>
            <Link
              href={WHY_SATISFACTION.cta.href}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-md bg-theme-primary px-7 text-base font-bold text-white transition-colors hover:bg-theme-primary-dark
                         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary"
            >
              {WHY_SATISFACTION.cta.text}
              <ArrowRight aria-hidden className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="why-near-me" className={BLUE}>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14">
          <div className="min-w-0">
            <h2 id="why-near-me" className={H2_DARK}>
              <Link href={WHY_NEAR_ME.heading.href} className="underline-offset-4 hover:text-[#F4BF3C] hover:underline">
                {WHY_NEAR_ME.heading.text}
              </Link>
            </h2>
            <p className="mt-4 text-lg font-extrabold text-[#F4BF3C]">{WHY_NEAR_ME.lead}</p>
            <p className="mt-2 text-base leading-relaxed text-white/90 sm:text-lg">{WHY_NEAR_ME.body}</p>
          </div>
          <div className="mx-auto w-full max-w-sm">
            <Image
              src={WHY_NEAR_ME.image.src}
              alt={WHY_NEAR_ME.image.alt}
              width={WHY_NEAR_ME.image.width}
              height={WHY_NEAR_ME.image.height}
              sizes="(max-width: 1024px) 90vw, 384px"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="why-prices" className={WHITE}>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-14">
          <div className="min-w-0">
            <h2 id="why-prices" className={H2_LIGHT}>{WHY_PRICES.heading}</h2>
            <p className={BODY_LIGHT}>{WHY_PRICES.body}</p>
            <div className="mt-8 rounded-xl border-l-4 border-theme-primary bg-theme-subtle p-6 dark:bg-neutral-900">
              <h3 className="text-xl font-extrabold text-theme-dark dark:text-white">{WHY_PRICES.moneyBackHeading}</h3>
              <p className="mt-2 text-base leading-relaxed text-theme-mid dark:text-neutral-300">
                <WhyRichText parts={WHY_PRICES.moneyBack} />
              </p>
            </div>
          </div>
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl bg-white">
            <Image
              src={WHY_PRICES.image.src}
              alt={WHY_PRICES.image.alt}
              width={WHY_PRICES.image.width}
              height={WHY_PRICES.image.height}
              sizes="320px"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>
    </>
  )
}
