'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { QUOTE_FORM_ID, QUOTE_SENDING_EVENT } from './quoteFormId'

/**
 * "Proceed with checkout" — the summary panel's action, and the only way
 * forward on this page.
 *
 * It submits the contact form beside it through the `form` attribute, so the
 * button can sit in the panel while the fields and their checks stay in the
 * form. The form's own submit button was removed when this arrived: the
 * 2026-09-29 design puts the action beside the total it commits to.
 *
 * The pending state comes from the form itself (QUOTE_SENDING_EVENT): it is
 * true while the details are on their way to Zoho, so a second press cannot
 * send them twice, and false again if Zoho refuses them — the form then shows
 * why, and the visitor can correct and press again. After an accepted send the
 * page is leaving for checkout, so the button stays in its pending state.
 */
export function QuoteProceedButton() {
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const onSending = (event: Event) => setPending((event as CustomEvent<boolean>).detail === true)
    document.addEventListener(QUOTE_SENDING_EVENT, onSending)
    return () => document.removeEventListener(QUOTE_SENDING_EVENT, onSending)
  }, [])

  return (
    <button
      type="submit"
      form={QUOTE_FORM_ID}
      disabled={pending}
      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-theme-primary px-6 py-4 text-base font-bold text-white shadow-sm transition-colors hover:bg-theme-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus-visible:ring-offset-neutral-900"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Sending Your Details
        </>
      ) : (
        <>
          Proceed with checkout
          <ArrowRight className="h-5 w-5" aria-hidden />
        </>
      )}
    </button>
  )
}
