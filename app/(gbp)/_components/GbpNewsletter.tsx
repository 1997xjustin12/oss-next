import Image from 'next/image'
import { AccentText } from '@/components/shared/AccentText'
import { GBP_ZOHO_FORMS } from '@/lib/data/gbpShared'
import { ZohoNewsletterForm } from './ZohoNewsletterForm'
import { GBP_ACCENT, GBP_CONTAINER } from './gbpStyles'

const NEWSLETTER = GBP_ZOHO_FORMS.newsletter

/**
 * The red newsletter band: a white card with the pitch and the form, the
 * container photo behind the form's side (as on WordPress; not on phones).
 */
export function GbpNewsletter() {
  return (
    <section aria-labelledby="gbp-newsletter" className="bg-[#C60C29] py-8 sm:py-10 dark:bg-[#7a0718]">
      <div className={GBP_CONTAINER}>
        <div className="relative isolate grid items-center gap-6 overflow-hidden rounded-2xl bg-neutral-100 p-6 shadow-lg md:grid-cols-2 md:p-10 dark:bg-neutral-900">
          <Image
            src={NEWSLETTER.background}
            alt=""
            fill
            sizes="(max-width: 768px) 0px, 1400px"
            className="-z-10 hidden object-cover object-right opacity-90 md:block dark:opacity-40"
          />
          <div className="text-center">
            <h2 id="gbp-newsletter" className="text-2xl font-bold leading-[1.1] text-black md:text-[30px] dark:text-white">
              <AccentText text={NEWSLETTER.heading} accentClassName={`block ${GBP_ACCENT}`} />
            </h2>
            <p className="mt-5 text-base font-normal leading-normal text-black dark:text-neutral-200">{NEWSLETTER.body}</p>
            <p className="mt-1 text-base font-semibold leading-normal text-[#FF0000] dark:text-red-400">{NEWSLETTER.note}</p>
          </div>
          <div className="rounded-lg bg-white/90 p-4 md:bg-transparent md:p-0 dark:bg-neutral-900/90 md:dark:bg-neutral-900/80 md:dark:p-4">
            <ZohoNewsletterForm />
          </div>
        </div>
      </div>
    </section>
  )
}
