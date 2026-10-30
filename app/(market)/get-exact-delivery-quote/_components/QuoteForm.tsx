import { DeliveryQuoteForm } from './DeliveryQuoteForm'
import { one, type SearchParams } from './searchParams'

/**
 * The contact form, streamed rather than prerendered.
 *
 * It reads the query string (the ZIP the quote is priced to), which is
 * request-time data. Under `cacheComponents` that has to sit behind Suspense or
 * it blocks the whole route, so the banner, headings and value props above and
 * below it stay static and indexable while this arrives.
 *
 * The form itself is DeliveryQuoteForm, the Zoho quote form shared with the
 * product page's guest lead modal: it fills itself in from what this browser
 * already has, sends to Zoho CRM, and shows its own errors, so a refused send
 * never leaves the page. Until 2026-10-30 this posted to a Server Action that
 * stored the lead for the admin and carried the details to the next page in a
 * draft cookie; with the lead in Zoho and the details saved in the browser,
 * neither is needed.
 *
 * Preferred contact, interest and timeline were asked here until 2026-09-23.
 * The design dropped them and the client confirmed it: they cost three more
 * decisions on a form whose only job is to get a quote sent.
 */
export async function QuoteForm({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  return (
    <DeliveryQuoteForm quotedZip={one(params.zip)}>
      {/* "Step 3 of 4" against the design's "Step 2 of 4": the progress bar
          above this card counts Product and Location as the first two, and the
          client confirmed the design was mislabelled rather than a renumbering. */}
      <p className="text-sm font-medium text-theme-muted">Step 3 of 4:</p>
      <h2 className="mt-1 text-xl font-bold text-theme-primary sm:text-2xl">Your Contact Information:</h2>
      <p className="mt-1 text-xs text-theme-muted">We&rsquo;ll use this to send you your exact delivery quote.</p>
    </DeliveryQuoteForm>
  )
}
