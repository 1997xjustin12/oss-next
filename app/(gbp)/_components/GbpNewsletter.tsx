import Image from 'next/image'
import { AccentText } from '@/components/shared/AccentText'
import { ZohoNewsletterForm } from './ZohoNewsletterForm'
import { GBP_ACCENT, GBP_BG_RED, GBP_CONTAINER, GBP_HEADING, sectionPadding, sectionVars } from './gbpStyles'
import type { GbpSectionStyle, GbpSharedContent } from '@/types/gbp'

type Props = { content: GbpSharedContent['newsletter']; style?: GbpSectionStyle }

/**
 * The red newsletter band: a white card with the pitch and the form, the
 * container photo behind the form's side (as on WordPress; not on phones).
 */
export function GbpNewsletter({ content, style }: Props) {
  return (
    <section aria-labelledby="gbp-newsletter" className={`${GBP_BG_RED} ${sectionPadding(style, 'py-8 sm:py-10')}`} style={sectionVars(style)}>
      <div className={GBP_CONTAINER}>
        <div className="relative isolate grid items-center gap-6 overflow-hidden rounded-2xl bg-neutral-100 p-6 shadow-lg md:grid-cols-2 md:p-10 dark:bg-neutral-900">
          <Image
            src={content.background}
            alt=""
            fill
            sizes="(max-width: 768px) 0px, 1400px"
            className="-z-10 hidden object-cover object-right opacity-90 md:block dark:opacity-40"
          />
          <div className="text-center">
            <h2 id="gbp-newsletter" className={`text-2xl font-bold leading-[1.1] md:text-[30px] ${GBP_HEADING}`}>
              <AccentText text={content.heading} accentClassName={`block ${GBP_ACCENT}`} />
            </h2>
            <p className="mt-5 text-base font-normal leading-normal text-black dark:text-neutral-200">{content.body}</p>
            {content.note && (
              // Brand red, not the heading accent: #FF0000 at 16px on the card's grey is 3.7:1, under AA's 4.5:1.
              <p className="mt-1 text-base font-semibold leading-normal text-[var(--gbp-brand,#C60C29)] dark:text-red-400">{content.note}</p>
            )}
          </div>
          <div className="rounded-lg bg-white/90 p-4 md:bg-transparent md:p-0 dark:bg-neutral-900/90 md:dark:bg-neutral-900/80 md:dark:p-4">
            <ZohoNewsletterForm />
          </div>
        </div>
      </div>
    </section>
  )
}
