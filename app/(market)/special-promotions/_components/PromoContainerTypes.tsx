import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { ROUTES } from '@/config/routes'
import {
  PROMO_DRY_VAN,
  PROMO_HEADING,
  PROMO_INTRO,
  PROMO_LINKS,
  PROMO_REEFER,
  PROMO_RESOURCES,
  PROMO_SPECIALTY,
  type PromoImage,
} from '@/lib/data/specialPromotionsContent'
import { CategoryRibbon } from './CategoryRibbon'

const BUTTON =
  'inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0F3A59] px-6 text-sm font-bold text-white transition-colors hover:bg-[#0b2c44] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F3A59] dark:bg-sky-800 dark:hover:bg-sky-700'
const CARD = 'flex h-full flex-col overflow-hidden rounded-xl border border-theme-border bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900'
const SUBHEADING = 'text-xl font-extrabold text-theme-dark sm:text-2xl dark:text-white'

function Photo({ image, sizes, aspect = 'aspect-4/3' }: { image: PromoImage; sizes: string; aspect?: string }) {
  return (
    <div className={`relative ${aspect} w-full overflow-hidden bg-theme-subtle dark:bg-neutral-800`}>
      <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />
    </div>
  )
}

/** A card whose photo and title are the link, with an optional button below. */
function LinkCard({ title, href, image, cta, sizes }: { title: string; href: string; image: PromoImage; cta?: string; sizes: string }) {
  return (
    <article className={CARD}>
      <Photo image={image} sizes={sizes} />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="text-base font-extrabold uppercase leading-snug text-theme-dark dark:text-white">
          <Link href={href} className="hover:text-theme-primary dark:hover:text-red-400">{title}</Link>
        </h3>
        {cta && (
          <Link href={href} className={`mt-auto self-start ${BUTTON}`}>
            {cta}
            <ArrowRight aria-hidden className="h-4 w-4" />
            <span className="sr-only">: {title.toLowerCase()}</span>
          </Link>
        )}
      </div>
    </article>
  )
}

/**
 * The second blue "on sale" band and the container groups under it, in
 * WordPress's order: dry vans (doors, sizes), refrigerated, specialty, and the
 * resource articles.
 */
export function PromoContainerTypes() {
  const reeferLinks = [ROUTES.REEFER, `${ROUTES.REEFER}#reefer-non-working`]

  return (
    <>
      <SectionTagline2 bg="blue" text={PROMO_HEADING} />

      <section aria-label="Types of shipping containers" className="bg-white px-[5%] py-10 sm:py-12 dark:bg-neutral-950">
        <div className="space-y-4 text-base leading-relaxed text-theme-mid sm:text-lg dark:text-neutral-300">
          {PROMO_INTRO.map((text) => (
            <p key={text.slice(0, 32)}>{text}</p>
          ))}
        </div>
      </section>

      <section aria-labelledby="promo-dry-van" className="bg-white pb-12 dark:bg-neutral-950">
        <CategoryRibbon id="promo-dry-van" heading={PROMO_DRY_VAN.heading} href={PROMO_LINKS.dryVan} />
        <div className="px-[5%]">
          <h3 className={`mt-6 ${SUBHEADING}`}>{PROMO_DRY_VAN.doorsHeading}</h3>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {PROMO_DRY_VAN.doors.map((card) => (
              <li key={card.title}>
                <LinkCard {...card} cta="LEARN MORE" sizes="(max-width: 768px) 90vw, 45vw" />
              </li>
            ))}
          </ul>

          <h3 className={`mt-12 ${SUBHEADING}`}>{PROMO_DRY_VAN.sizesHeading}</h3>
          <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
            {PROMO_DRY_VAN.sizeGroups.map((group) => (
              <section key={group.title} aria-label={group.title}>
                <h4 className="bg-[#0F3A59] px-4 py-2.5 text-center text-base font-semibold text-white sm:text-lg">
                  <Link href={group.href} className="hover:underline">{group.title}</Link>
                </h4>
                <ul className={`mt-4 grid gap-4 ${group.items.length === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
                  {group.items.map((item) => (
                    <li key={item.title}>
                      <Link href={item.href} className="group block text-center">
                        <div className="overflow-hidden rounded-lg">
                          <Photo image={item.image} sizes="(max-width: 640px) 45vw, 18vw" aspect="aspect-3/4" />
                        </div>
                        <span className="mt-3 block text-base font-semibold uppercase leading-snug text-theme-dark group-hover:text-theme-primary dark:text-white dark:group-hover:text-red-400">
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="promo-reefer" className="bg-white pb-12 dark:bg-neutral-950">
        <CategoryRibbon id="promo-reefer" heading={PROMO_REEFER.heading} href={ROUTES.REEFER} />
        <ul className="mt-8 grid gap-6 px-[5%] md:grid-cols-2">
          {PROMO_REEFER.items.map((item, index) => (
            <li key={item.title}>
              <LinkCard title={item.title} href={reeferLinks[index]} image={item.image} cta={PROMO_REEFER.cta} sizes="(max-width: 768px) 90vw, 45vw" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="promo-specialty" className="bg-white pb-12 dark:bg-neutral-950">
        <CategoryRibbon id="promo-specialty" heading={PROMO_SPECIALTY.heading} href={PROMO_LINKS.specialty} />
        <ul className="mt-8 grid gap-6 px-[5%] sm:grid-cols-2 lg:grid-cols-3">
          {PROMO_SPECIALTY.items.map((card) => (
            <li key={card.title}>
              <LinkCard {...card} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="promo-resources" className="bg-white pb-12 sm:pb-16 dark:bg-neutral-950">
        <CategoryRibbon id="promo-resources" heading={PROMO_RESOURCES.heading} href={PROMO_LINKS.resources} />
        <ul className="mt-8 grid gap-5 px-[5%] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {PROMO_RESOURCES.items.map((card) => (
            <li key={card.title}>
              <LinkCard {...card} cta={PROMO_RESOURCES.cta} sizes="(max-width: 640px) 90vw, (max-width: 1280px) 30vw, 15vw" />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
