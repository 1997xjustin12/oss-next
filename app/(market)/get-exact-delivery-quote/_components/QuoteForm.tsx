import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { resolveDeliveryQuote } from '@/lib/deliveryQuote'
import { readQuoteDraft } from '@/lib/quoteDraft'
import { submitDeliveryQuote } from '@/actions/deliveryQuote'
import { ContactFields } from './ContactFields'
import { CartLeadFields } from './CartLeadFields'
import { ShippingAddressFields } from './ShippingAddressFields'
import { one, type SearchParams } from './searchParams'

/**
 * The contact form, streamed rather than prerendered.
 *
 * It reads the query string (for the container it is quoting) and a cookie (to
 * repopulate after a failed submit), both of which are request-time data. Under
 * `cacheComponents` that has to sit behind Suspense or it blocks the whole
 * route, so the banner, headings and value props above and below it stay
 * static and indexable while this arrives.
 *
 * The contact and address blocks are client components, because both fall back
 * to what the guest-lead modal left in `localStorage` — a server-rendered form
 * cannot see it, which is why this page used to greet a visitor who had just
 * given their details with an empty form. Everything else here is
 * server-rendered, and validation is the browser's plus a re-check in the
 * action.
 *
 * Preferred contact, interest and timeline were asked here until 2026-09-23.
 * The design dropped them and the client confirmed it: they cost three more
 * decisions on a form whose only job is to get a quote sent. Sales no longer
 * receives "Preferred contact / Interested in / Timeline" on a quote lead.
 */

/** Keyed by the code the action redirects back with. */
const ERRORS: Record<string, string> = {
  name: 'Please tell us your name so we know who we are quoting.',
  email: 'That email address does not look right — check it and try again.',
  address: 'Please give the full delivery address — street, city and state.',
  phone: 'Please add a phone number we can reach you on.',
  zip: 'Please set the delivery ZIP code — we cannot quote delivery without it.',
  consent: 'Please confirm the delivery requirement and agree to the terms.',
}

const SELECT_LIKE =
  'w-full appearance-none rounded-md border border-theme-border bg-theme-bg px-4 py-3 text-sm text-theme-dark outline-none transition-colors focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/25 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white'

const CHECKBOX = 'mt-0.5 h-4 w-4 shrink-0 accent-theme-primary'
const CHECKBOX_ROW = 'flex items-start gap-2.5 text-sm text-theme-dark dark:text-neutral-200'

export async function QuoteForm({
  searchParams,
  submitButton,
}: {
  searchParams: SearchParams
  /** The client submit button, passed in so this stays a Server Component. */
  submitButton: React.ReactNode
}) {
  const params = await searchParams
  const handle = one(params.handle)
  const zip = one(params.zip)
  const qty = one(params.qty)

  const [quote, draft] = await Promise.all([
    resolveDeliveryQuote({ handle, zip, qty }),
    readQuoteDraft(),
  ])

  const error = one(params.error)
  const errorMessage = error
    ? (ERRORS[error] ?? 'Something was missing — please check the form.')
    : null

  return (
    <form
      action={submitDeliveryQuote}
      className="rounded-lg border border-theme-border bg-theme-bg p-5 shadow-sm sm:p-7 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* The container context travels with the submission, so the lead
          reaching sales says which container and which ZIP. */}
      {handle && <input type="hidden" name="handle" value={handle} />}
      {zip && <input type="hidden" name="zip" value={zip} />}
      {qty && <input type="hidden" name="qty" value={qty} />}

      {/* The cart, when there is one — see CartLeadFields. Client-side, because
          the cart lives in localStorage and this form is server-rendered. */}
      <CartLeadFields />

      {/* "Step 3 of 4" against the design's "Step 2 of 4": the progress bar
          above this card counts Product and Location as the first two, and the
          client confirmed the design was mislabelled rather than a renumbering. */}
      <p className="text-sm font-medium text-theme-muted">Step 3 of 4:</p>
      <h2 className="mt-1 text-xl font-bold text-theme-primary sm:text-2xl">
        Your Contact Information:
      </h2>
      <p className="mt-1 text-xs text-theme-muted">
        We&rsquo;ll use this to send you your exact delivery quote.
      </p>

      {errorMessage && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-theme-primary/30 bg-theme-primary/5 px-4 py-3 text-sm font-medium text-theme-primary dark:border-theme-primary/40 dark:bg-theme-primary/10 dark:text-red-300"
        >
          {errorMessage}
        </p>
      )}

      <ContactFields
        defaults={{ fullName: draft?.fullName, phone: draft?.phone, email: draft?.email }}
      />

      {/* Was a single "Complete Delivery Address" box. Delivery is priced per
          address and a ZIP alone cannot say whether a truck can reach the site,
          so this asks in the shape checkout needs — which is also what lets the
          answers fill checkout in later. See ShippingAddressFields. */}
      <ShippingAddressFields
        quotedZip={zip}
        defaults={{
          address1: draft?.address1 || draft?.address,
          address2: draft?.address2,
          city: draft?.city,
          state: draft?.state,
          zip: draft?.zip,
          country: draft?.country,
        }}
      />

      {/* Nothing on this page collects a billing address, so unticking this
          changes no field here — it travels to the lead so whoever prices the
          order knows to ask for one. Ticked by default, as checkout is. */}
      <label className={`mt-6 ${CHECKBOX_ROW}`}>
        <input
          type="checkbox"
          name="invoiceSameAsDelivery"
          value="yes"
          defaultChecked
          className={CHECKBOX}
        />
        Invoice address is the same as delivery address
      </label>

      <div className="mt-6">
        <label htmlFor="details" className="text-sm font-semibold text-theme-dark dark:text-white">
          Shipping note <span className="font-normal text-theme-muted">(optional)</span>
        </label>
        {/* Still `details` on the wire: the action and the stored lead already
            carry that name, so renaming the field would only rename it. */}
        <input
          id="details"
          name="details"
          defaultValue={draft?.details}
          placeholder="Anything that helps us deliver — gate codes, access, timing."
          className={`${SELECT_LIKE} mt-2.5 block h-12 w-full placeholder:text-theme-muted`}
        />
      </div>

      {/* Both required, and neither ticked to begin with. The design draws them
          ticked, but a pre-ticked consent is not consent — the visitor has to
          be the one who agrees. Enforced by the browser and re-checked in the
          action, the same pair checkout already gates Place Order on. */}
      <label className={`mt-6 ${CHECKBOX_ROW}`}>
        <input type="checkbox" name="confirmDelivery" value="yes" required className={CHECKBOX} />
        I confirm I&rsquo;ve read the delivery requirement and my site is suitable for delivery.
      </label>

      <label className={`mt-3 ${CHECKBOX_ROW}`}>
        <input type="checkbox" name="agreeTerms" value="yes" required className={CHECKBOX} />
        <span>
          I agree to the{' '}
          <Link
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-theme-primary hover:underline"
          >
            terms &amp; conditions
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-theme-primary hover:underline"
          >
            privacy policy
          </Link>
        </span>
      </label>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={quote.backHref}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-theme-border bg-theme-bg px-6 py-3 text-sm font-semibold text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </Link>

        {submitButton}
      </div>
    </form>
  )
}
