import { Suspense } from 'react'

import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { QuoteStepIndicator } from './_components/QuoteStepIndicator'
import { QuoteForm } from './_components/QuoteForm'
import { QuoteSummarySection } from './_components/QuoteSummarySection'
import { QuoteValueProps } from './_components/QuoteValueProps'
import { QuoteSubmitButton } from './_components/QuoteSubmitButton'
import { QuoteFormSkeleton, QuoteSummarySkeleton } from './_components/QuoteSkeletons'
import type { SearchParams } from './_components/searchParams'

/**
 * Step 3 of the delivery quote: who to send it to.
 *
 * A Server Component with a Server Action, deliberately. Delivery is priced per
 * address, so this is a real landing target for "delivery cost" searches, and
 * its copy has to render on the server rather than behind a hydration boundary.
 * The only client code on the page is the submit button, which needs
 * `useFormStatus` to stop a double post putting two identical leads into
 * someone's sales queue.
 *
 * This shell is static: heading, progress and the reassurance below are the
 * same for everyone and prerender. The form and the summary read the query
 * string and a cookie, so they stream in behind Suspense — under
 * `cacheComponents` reading either out here would make the whole route
 * request-time and there would be nothing left to prerender.
 */

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.DELIVERY_QUOTE)
}

export default function DeliveryQuotePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeadScripts path={ROUTES.DELIVERY_QUOTE} />

      <main className="min-h-screen bg-theme-subtle dark:bg-neutral-950">
        <section className="bg-[#123A5E] dark:bg-[#0C2740]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-6">
            <div className="min-w-0">
              <h1 className="text-lg font-bold uppercase tracking-tight text-white sm:text-xl">
                Get your exact <span className="text-[#F5C24A]">delivery quote!</span>
              </h1>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-white/70 sm:text-sm">
                Almost there! Tell us a little something about you so we can help.
              </p>
            </div>

            <QuoteStepIndicator currentStep={3} />
          </div>
        </section>

        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_390px]">
            <Suspense fallback={<QuoteFormSkeleton />}>
              <QuoteForm searchParams={searchParams} submitButton={<QuoteSubmitButton />} />
            </Suspense>

            <Suspense fallback={<QuoteSummarySkeleton />}>
              <QuoteSummarySection searchParams={searchParams} />
            </Suspense>
          </div>

          <QuoteValueProps />
        </div>
      </main>
    </>
  )
}
