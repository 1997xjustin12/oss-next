import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { ROUTES } from '@/config/routes'
import { resolvePageMetadata } from '@/lib/seo'
import { ThankYouHero } from './_components/ThankYouHero'
import { ThankYouMessage } from './_components/ThankYouMessage'
import { ThankYouSteps } from './_components/ThankYouSteps'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.TAX_EXEMPTION_THANK_YOU)
}

/**
 * Where Zoho sends a visitor after the sales tax exemption form, native at the
 * URL WordPress served it from (TAX_EXEMPTION_FORM.hidden.returnURL points here).
 * Static, and Server Components only: nothing on it needs the browser.
 */
export default function TaxExemptionThankYouPage() {
  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <PageHeadScripts path={ROUTES.TAX_EXEMPTION_THANK_YOU} />

      <ThankYouHero />

      <section aria-label="Your request" className="bg-white px-[5%] py-10 sm:py-14 dark:bg-neutral-950">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          <ThankYouMessage />
          <ThankYouSteps />
        </div>
      </section>
    </div>
  )
}
