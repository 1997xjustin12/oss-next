import { Suspense } from 'react'

import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { QuoteStepIndicator } from '../_components/QuoteStepIndicator'
import { QuoteReviewBody } from '../_components/QuoteReviewBody'
import { QuoteValueProps } from '../_components/QuoteValueProps'
import { QuoteReviewSkeleton } from '../_components/QuoteSkeletons'
import type { SearchParams } from '../_components/searchParams'

/**
 * Step 4 of the delivery quote: the quote those details bought.
 *
 * Same static shell as step 3 — banner, progress, reassurance — with the
 * personalised half streamed behind Suspense, since it reads the draft cookie
 * and the query string.
 *
 * Marked `noindex` in the SEO defaults: it is the far side of a form
 * submission, reached by redirect, and there is nothing here to rank on.
 */

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.DELIVERY_QUOTE_REVIEW)
}

export default function DeliveryQuoteReviewPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <>
      <PageHeadScripts path={ROUTES.DELIVERY_QUOTE_REVIEW} />

      <main className="min-h-screen bg-theme-subtle dark:bg-neutral-950">
        <section className="bg-[#123A5E] dark:bg-[#0C2740]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-6">
            <div className="min-w-0">
              <h1 className="text-lg font-bold uppercase tracking-tight text-white sm:text-xl">
                Your <span className="text-[#F5C24A]">delivery quote</span>
              </h1>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-white/70 sm:text-sm">
                We have your details. Here is what you asked about.
              </p>
            </div>

            <QuoteStepIndicator currentStep={4} />
          </div>
        </section>

        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
          <Suspense fallback={<QuoteReviewSkeleton />}>
            <QuoteReviewBody searchParams={searchParams} />
          </Suspense>

          <QuoteValueProps />
        </div>
      </main>
    </>
  )
}
