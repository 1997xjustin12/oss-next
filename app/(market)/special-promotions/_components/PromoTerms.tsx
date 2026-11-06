import { SectionTagline2 } from '@/components/shared/SectionTagline2'
import { PROMO_PHONES, PROMO_TERMS } from '@/lib/data/specialPromotionsContent'
import { telHref } from '@/lib/helpers'

/** The promotion terms, under their blue band. The phone number dials what WordPress's link dialled. */
export function PromoTerms() {
  const { band, intro, items, release, contactBefore, contactAfter } = PROMO_TERMS

  return (
    <>
      <SectionTagline2 bg="blue" text={band} />
      <section aria-label={band} className="bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950">
        <div className="max-w-4xl space-y-5 text-[15px] leading-relaxed text-theme-mid sm:text-base dark:text-neutral-300">
          <p>{intro}</p>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.label} className="rounded-lg border-l-4 border-theme-primary bg-theme-subtle p-4 dark:bg-neutral-900">
                <strong className="block font-bold text-theme-dark dark:text-white">{item.label}</strong>
                {item.body}
              </li>
            ))}
          </ul>
          <p>{release}</p>
          <p>
            {contactBefore}{' '}
            <a href={telHref(PROMO_PHONES.main)} className="font-semibold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400">
              {PROMO_PHONES.main}
            </a>
            {contactAfter}
          </p>
        </div>
      </section>
    </>
  )
}
