import { AccentText } from '@/components/shared/AccentText'
import { GBP_ZOHO_FORMS } from '@/lib/data/gbpShared'
import { ZohoQuoteForm } from './ZohoQuoteForm'
import { GBP_ACCENT, GBP_CONTAINER, GBP_H2 } from './gbpStyles'

type Props = { mapEmbedUrl: string; city: string }

/**
 * "Get the Best Pricing Now!" (`#request_quote`): the page's Google Business
 * listing on a map beside the shared quote form. The map is a lazy iframe, so
 * it costs nothing until the visitor scrolls near it.
 */
export function GbpQuote({ mapEmbedUrl, city }: Props) {
  return (
    <section
      id={GBP_ZOHO_FORMS.quote.anchor}
      aria-labelledby="gbp-quote"
      className="scroll-mt-4 bg-white py-10 sm:py-12 dark:bg-neutral-950"
    >
      <div className={GBP_CONTAINER}>
        <h2 id="gbp-quote" className={GBP_H2}>
          <AccentText text={GBP_ZOHO_FORMS.quote.heading} accentClassName={GBP_ACCENT} />
        </h2>
        <div className="mt-8 grid overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.15)] md:grid-cols-2 dark:border-neutral-800 dark:bg-neutral-900">
          <iframe
            src={mapEmbedUrl}
            title={`Map: On-Site Storage Solutions, ${city}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="h-72 w-full border-0 md:h-full md:min-h-[420px]"
          />
          <div className="p-5 sm:p-6">
            <ZohoQuoteForm />
          </div>
        </div>
      </div>
    </section>
  )
}
