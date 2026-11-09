import { AccentText } from '@/components/shared/AccentText'
import { NewsletterForm } from '@/components/shared/NewsletterForm'
import type { LocationTemplateText } from '@/types/locationPage'

type Props = { text: LocationTemplateText['newsletter'] }

/**
 * "Get the Best Deals on Containers – Before Anyone Else!": the newsletter
 * signup, through `NewsletterForm` (Zoho and Django, as every newsletter form
 * here: migration doc §6), on the red band.
 */
export function LocationNewsletter({ text }: Props) {
  return (
    <section aria-labelledby="location-newsletter" className="bg-theme-primary px-[5%] py-10 sm:py-12">
      <div className="grid items-center gap-8 rounded-2xl bg-white p-6 shadow-lg sm:p-10 lg:grid-cols-2 dark:bg-neutral-900">
        <div className="text-center">
          <h2 id="location-newsletter" className="text-2xl font-bold leading-tight text-theme-dark sm:text-3xl dark:text-white">
            <AccentText text={text.heading} accentClassName="block text-theme-primary dark:text-red-400" />
          </h2>
          <p className="mt-4 text-base text-theme-mid dark:text-neutral-300">{text.body}</p>
          <p className="mt-2 text-base font-bold text-theme-primary dark:text-red-400">{text.note}</p>
        </div>
        <NewsletterForm />
      </div>
    </section>
  )
}
