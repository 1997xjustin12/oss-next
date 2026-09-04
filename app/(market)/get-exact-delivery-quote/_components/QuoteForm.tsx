import Link from 'next/link'
import { ArrowLeft, Check, ChevronDown, Mail, Phone } from 'lucide-react'

import { resolveDeliveryQuote } from '@/lib/deliveryQuote'
import { readQuoteDraft } from '@/lib/quoteDraft'
import { submitDeliveryQuote } from '@/actions/deliveryQuote'
import { QuoteTextField } from './QuoteTextField'
import { CartLeadFields } from './CartLeadFields'
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
 * No client JS beyond the submit button: the radio group and checkboxes are
 * styled with `peer-checked`, and validation is the browser's plus a real
 * re-check in the action.
 */

const INTERESTS = [
  { value: 'purchase', label: 'Purchase', defaultChecked: true },
  { value: 'rent', label: 'Rent', defaultChecked: false },
  { value: 'rent-to-own', label: 'Rent-to-own', defaultChecked: false },
] as const

const TIMELINES = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-2-weeks', label: 'Within 1-2 weeks' },
  { value: '1-month', label: 'Within a month' },
  { value: '1-3-months', label: '1-3 months out' },
  { value: 'just-researching', label: 'Just researching for now' },
] as const

const CONTACT_METHODS = [
  { value: 'phone', label: 'Phone call', Icon: Phone },
  { value: 'email', label: 'Email', Icon: Mail },
] as const

/** Keyed by the code the action redirects back with. */
const ERRORS: Record<string, string> = {
  name: 'Please tell us your name so we know who we are quoting.',
  email: 'That email address does not look right — check it and try again.',
  'email-mismatch': 'The two email addresses do not match.',
  phone: 'Please add a phone number we can reach you on.',
}

const OPTION_CHIP =
  'flex items-center justify-center gap-2 rounded-md border border-theme-border bg-theme-bg px-3 py-2.5 text-sm font-medium text-theme-muted transition-colors peer-checked:border-theme-primary peer-checked:bg-theme-primary/5 peer-checked:text-theme-primary peer-focus-visible:ring-2 peer-focus-visible:ring-theme-primary/40 dark:border-neutral-700 dark:bg-neutral-900 dark:peer-checked:bg-theme-primary/15 dark:peer-checked:text-red-300'

const SELECT_LIKE =
  'w-full appearance-none rounded-md border border-theme-border bg-theme-bg px-4 py-3 text-sm text-theme-dark outline-none transition-colors focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/25 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white'

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

      <p className="text-sm font-medium text-theme-muted">Step 3 of 4:</p>
      <h2 className="mt-1 text-xl font-bold text-theme-primary sm:text-2xl">
        Your contact information
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

      <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        <QuoteTextField
          id="fullName"
          name="fullName"
          label="Full Name"
          autoComplete="name"
          defaultValue={draft?.fullName}
          required
        />

        <div>
          <QuoteTextField
            id="phone"
            name="phone"
            type="tel"
            label="Phone Number"
            autoComplete="tel"
            defaultValue={draft?.phone}
            required
          />
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-theme-success-dark dark:text-emerald-400">
            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
            We&rsquo;ll use this to send you your exact delivery quote.
          </p>
        </div>

        <QuoteTextField
          id="email"
          name="email"
          type="email"
          label="Email Address"
          autoComplete="email"
          defaultValue={draft?.email}
          required
        />
        <QuoteTextField
          id="confirmEmail"
          name="confirmEmail"
          type="email"
          label="Confirm Email Address"
          autoComplete="email"
          required
        />
      </div>

      {/* CSS-only radio group — no client JS for a two-option choice. */}
      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-theme-dark dark:text-white">
          Best way to contact you{' '}
          <span className="text-theme-primary" aria-hidden>
            *
          </span>
          <span className="sr-only">(required)</span>
        </legend>

        <div className="mt-2.5 grid max-w-md grid-cols-2 gap-3">
          {CONTACT_METHODS.map(({ value, label, Icon }) => (
            <label key={value} className="relative block cursor-pointer">
              <input
                type="radio"
                name="contactMethod"
                value={value}
                defaultChecked={(draft?.contactMethod ?? 'phone') === value}
                className="peer sr-only"
              />
              <span className={OPTION_CHIP}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-theme-dark dark:text-white">
          What are you interested in?{' '}
          <span className="font-normal text-theme-muted">(Select all that apply)</span>
        </legend>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-10">
          {INTERESTS.map((item) => (
            <label
              key={item.value}
              className="relative flex cursor-pointer items-center gap-2.5 text-sm text-theme-mid dark:text-neutral-200"
            >
              <input
                type="checkbox"
                name="interests"
                value={item.value}
                defaultChecked={draft ? draft.interests.includes(item.value) : item.defaultChecked}
                className="peer h-5 w-5 shrink-0 appearance-none rounded border border-theme-border bg-theme-subtle transition-colors checked:border-theme-primary checked:bg-theme-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/40 dark:border-neutral-600 dark:bg-neutral-700 dark:checked:bg-neutral-900"
              />
              <Check
                className="pointer-events-none absolute left-0.5 top-1/2 h-4 w-4 -translate-y-1/2 stroke-[3] text-theme-primary opacity-0 transition-opacity peer-checked:opacity-100"
                aria-hidden
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="timeline" className="text-sm font-semibold text-theme-dark dark:text-white">
          When are you looking to get a container?
        </label>
        <div className="relative mt-2.5 max-w-md">
          <select
            id="timeline"
            name="timeline"
            defaultValue={draft?.timeline || '1-2-weeks'}
            className={`${SELECT_LIKE} pr-10`}
          >
            {TIMELINES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted"
            aria-hidden
          />
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="details" className="text-sm font-semibold text-theme-dark dark:text-white">
          Additional details <span className="font-normal text-theme-muted">(optional)</span>
        </label>
        <textarea
          id="details"
          name="details"
          rows={3}
          defaultValue={draft?.details}
          placeholder="Tell us anything that will help us provide the most accurate quote."
          className={`${SELECT_LIKE} mt-2.5 block max-w-xl resize-y placeholder:text-theme-muted`}
        />
      </div>

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
