import Link from 'next/link'
import { ArrowLeft, Check, Clock, Phone } from 'lucide-react'

import { CONTACT_NUMBER } from '@/lib/helpers'
import { resolveDeliveryQuote } from '@/lib/deliveryQuote'
import { readQuoteDraft } from '@/lib/quoteDraft'
import { PersistGuestLead } from './PersistGuestLead'
import { QuoteReviewLines } from './QuoteReviewLines'
import { one, type SearchParams } from './searchParams'

/**
 * The quote itself, on step 4.
 *
 * Laid out like the second step of `GuestLeadModal` — same product header, same
 * line list, same estimated total — because someone who met that modal on a
 * product page should recognise this as the same thing, and because the modal
 * already settled how a quote reads.
 *
 * The lead is filed before this renders, which is why the page confirms rather
 * than asks: the remaining actions are ways to get an answer sooner, not
 * another form.
 *
 * It does not depend on having been redirected here. Open the URL directly, or
 * refresh an hour later once the draft cookie has expired, and the page is
 * still coherent — just without a name on it.
 */

const CONTACT_TEL = `tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`

export async function QuoteReviewBody({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const [quote, draft] = await Promise.all([
    resolveDeliveryQuote({
      handle: one(params.handle),
      zip: one(params.zip),
      qty: one(params.qty),
    }),
    readQuoteDraft(),
  ])

  const firstName = draft?.fullName.trim().split(/\s+/)[0] || null

  return (
    <section className="rounded-lg border border-theme-border bg-theme-bg p-5 shadow-sm sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Hands the details to the same store the product page's quote modal
          reads, so the next visit recognises this person instead of sending
          them back through this form. The ZIP stands in for the address: it is
          the only part of a delivery destination this flow asks for. */}
      {draft && (
        <PersistGuestLead
          fullName={draft.fullName}
          email={draft.email}
          phone={draft.phone}
          address={quote.zip ?? ''}
        />
      )}

      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-theme-primary">
        Step 4 of 4
      </p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-theme-dark sm:text-3xl dark:text-white">
        Your quote
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-theme-muted">
        {firstName ? `Thanks, ${firstName}. ` : 'Thanks. '}
        Here&rsquo;s what you asked about — a specialist will follow up
        {draft?.email ? (
          <>
            {' '}
            at{' '}
            <span className="font-semibold text-theme-dark dark:text-white">{draft.email}</span>
          </>
        ) : null}
        .
      </p>

      <div className="mt-5 overflow-hidden rounded-md border border-theme-border dark:border-neutral-800">
        {/* Header included: it has to make the same cart-or-URL choice the rows
            do, or a two-container order sits under a one-container title. */}
        <QuoteReviewLines lines={quote.lines} productTitle={quote.productTitle} />

        {quote.zip && (
          <div className="flex items-baseline justify-between gap-6 border-t border-theme-border px-4 py-2.5 text-sm dark:border-neutral-800">
            <span className="shrink-0 text-theme-muted">Delivery to</span>
            <span className="text-right font-semibold text-[#0F6FBF] dark:text-sky-400">
              {quote.zip}
            </span>
          </div>
        )}

        {quote.total && (
          <div className="flex items-end justify-between gap-4 border-t border-theme-border bg-theme-subtle px-4 py-3 dark:border-neutral-800 dark:bg-neutral-800/60">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-theme-muted">
              Estimated total
            </span>
            <span className="text-2xl font-bold leading-none tabular-nums tracking-tight text-theme-dark dark:text-white">
              {quote.total}
            </span>
          </div>
        )}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-1.5 text-xs font-semibold text-theme-primary">
        <Check className="h-3.5 w-3.5" aria-hidden />
        Sent. We typically reply in under 15 minutes during business hours.
      </p>

      <p className="mt-3 text-xs leading-relaxed text-theme-muted">
        Delivery is an estimate until we confirm site access, and sales tax is calculated at
        checkout. The exact delivery price for your address comes back with our reply.
      </p>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
        <Link
          href={CONTACT_TEL}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-theme-primary px-5 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call {CONTACT_NUMBER}
        </Link>

        <Link
          href={quote.backHref}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-theme-border bg-theme-bg px-5 text-sm font-semibold text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {quote.resolved ? 'Back to this container' : 'Browse containers'}
        </Link>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-theme-muted">
        <Clock className="h-3 w-3" aria-hidden />
        Mon-Fri 6 am - 5 pm PST &bull; Chat 24/7
      </p>
    </section>
  )
}
