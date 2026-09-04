import { resolveDeliveryQuote } from '@/lib/deliveryQuote'
import { QuoteSummaryPanel } from './QuoteSummaryPanel'
import { one, type SearchParams } from './searchParams'

/**
 * Resolves the quote from the query string, then hands it to the panel.
 *
 * Split from the panel itself so the panel stays a pure renderer that a test —
 * or the review page — can hand a context to directly, while the awaiting
 * happens behind this route's Suspense boundary.
 */
export async function QuoteSummarySection({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const quote = await resolveDeliveryQuote({
    handle: one(params.handle),
    zip: one(params.zip),
    qty: one(params.qty),
  })

  return <QuoteSummaryPanel quote={quote} />
}
