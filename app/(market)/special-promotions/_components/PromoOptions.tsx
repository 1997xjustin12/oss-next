import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { ROUTES } from '@/config/routes'
import { PROMO_GUARANTEE, PROMO_LINKS, PROMO_OPTIONS, PROMO_PHONES, PROMO_WHY, type PromoImage } from '@/lib/data/specialPromotionsContent'
import { telHref } from '@/lib/helpers'

const H2 = 'text-2xl font-bold uppercase leading-tight text-theme-primary sm:text-3xl dark:text-red-400'
const BODY = 'text-base leading-relaxed text-theme-mid dark:text-neutral-300'

function Photo({ image }: { image: PromoImage }) {
  return (
    <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-theme-subtle dark:bg-neutral-800">
      <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1024px) 90vw, 45vw" className="object-cover" />
    </div>
  )
}

/**
 * Buy, rent, rent-to-own and lease-to-purchase under their blue band, then the
 * guarantee and the reasons to buy. Each heading links where WordPress's did.
 */
export function PromoOptions() {
  const { band, buy, rentals, rentToOwn, lease } = PROMO_OPTIONS

  return (
    <>
      <SectionTagline2 bg="blue" text={band} />
      <section aria-label={band} className="space-y-12 bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <Photo image={buy.image} />
          <div>
            <h2 className={H2}><Link href={PROMO_LINKS.buy} className="hover:underline">{buy.heading}</Link></h2>
            <div className={`mt-4 space-y-4 ${BODY}`}>
              {buy.body.map((text) => (
                <p key={text.slice(0, 32)}>{text}</p>
              ))}
            </div>
          </div>
        </article>

        <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="lg:order-1">
            <h2 className={H2}><Link href={PROMO_LINKS.rental} className="hover:underline">{rentals.heading}</Link></h2>
            <p className={`mt-4 ${BODY}`}>
              {rentals.before}{' '}
              <a href={telHref(PROMO_PHONES.other)} className="font-bold text-[#0F3A59] underline underline-offset-2 hover:no-underline dark:text-sky-300">
                {PROMO_PHONES.other}
              </a>
              {rentals.after}
            </p>
          </div>
          <div className="lg:order-2">
            <Photo image={rentals.image} />
          </div>
        </article>

        <article className="rounded-xl border-l-4 border-theme-primary bg-theme-subtle p-6 sm:p-8 dark:bg-neutral-900">
          <h2 className={H2}><Link href={ROUTES.RENT_TO_OWN} className="hover:underline">{rentToOwn.heading}</Link></h2>
          <p className={`mt-4 ${BODY}`}>{rentToOwn.body}</p>
        </article>

        <article className="rounded-xl border border-theme-border p-6 sm:p-8 dark:border-neutral-800">
          <h2 className={`flex flex-wrap items-center gap-4 ${H2}`}>
            <a href={lease.href} className="inline-flex flex-wrap items-center gap-4 hover:underline">
              {lease.heading}
              <span className="relative inline-block h-12 w-44 rounded-md bg-white p-1 ring-1 ring-theme-border dark:ring-neutral-700">
                <Image src={lease.logo.src} alt={lease.logo.alt} fill sizes="176px" className="object-contain" />
              </span>
            </a>
          </h2>
          <p className={`mt-4 ${BODY}`}>{lease.body}</p>
        </article>
      </section>

      <SectionTagline2 bg="blue" text={PROMO_GUARANTEE.band} />
      <section aria-label={PROMO_GUARANTEE.band} className="space-y-12 bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <Photo image={PROMO_GUARANTEE.image} />
          <div>
            <h2 className={H2}><Link href={PROMO_LINKS.moneyBack} className="hover:underline">{PROMO_GUARANTEE.heading}</Link></h2>
            <p className={`mt-4 ${BODY}`}>{PROMO_GUARANTEE.body}</p>
          </div>
        </article>

        <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className={H2}><Link href={ROUTES.WHY_ONSITE} className="hover:underline">{PROMO_WHY.heading}</Link></h2>
            <h3 className="mt-3 text-lg font-bold text-theme-dark dark:text-white">{PROMO_WHY.subheading}</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {PROMO_WHY.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-[15px] text-theme-dark dark:text-neutral-200">
                  <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-theme-primary dark:text-red-400" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          <Photo image={PROMO_WHY.image} />
        </article>
      </section>
    </>
  )
}
