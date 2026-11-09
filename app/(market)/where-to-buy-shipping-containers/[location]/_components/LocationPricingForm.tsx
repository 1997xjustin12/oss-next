import { AccentText } from '@/components/shared/AccentText'
import { ZohoQuoteForm } from '@/components/shared/ZohoQuoteForm'
import { ZOHO_PRICING_FORM } from '@/lib/data/zohoForms'

type Props = { heading: string }

/**
 * "Get the Best Pricing Now!": the Zoho CRM pricing form the homepage and the
 * GBP pages use (the Los Angeles page posts to the same form, keys and all).
 * WordPress set a map beside it that pointed at San Diego; the form stands alone.
 */
export function LocationPricingForm({ heading }: Props) {
  return (
    <section
      id={ZOHO_PRICING_FORM.anchor}
      aria-labelledby="location-pricing"
      className="scroll-mt-4 bg-white px-[5%] py-12 sm:py-16 dark:bg-neutral-950"
    >
      <h2 id="location-pricing" className="text-center text-2xl font-bold text-theme-dark sm:text-3xl dark:text-white">
        <AccentText text={heading} accentClassName="text-theme-primary dark:text-red-400" />
      </h2>
      <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-neutral-200 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.12)] sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <ZohoQuoteForm />
      </div>
    </section>
  )
}
