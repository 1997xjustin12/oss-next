'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { QUOTE_FORM_ID } from './quoteFormId'

/**
 * "Proceed with checkout" — the summary panel's action, and the only way
 * forward on this page.
 *
 * It submits the contact form beside it through the `form` attribute, so the
 * button can sit in the panel while the fields, their validation and the
 * Server Action all stay where they are. The form's own submit button was
 * removed when this arrived: the 2026-09-29 design puts the action beside the
 * total it commits to.
 *
 * `useFormStatus` is not available here — that hook only reports for a form in
 * the same React tree, and this deliberately is not. So the pending state comes
 * from listening for the form's own `submit` event, which is equivalent for the
 * one thing it has to prevent: a second press posting a duplicate row into
 * someone's sales queue. The event fires only after the browser's own
 * validation passes, so an incomplete form leaves the button live rather than
 * stranding it disabled.
 */
export function QuoteProceedButton() {
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const form = document.getElementById(QUOTE_FORM_ID)
    if (!form) return

    const onSubmit = () => setPending(true)
    form.addEventListener('submit', onSubmit)
    return () => form.removeEventListener('submit', onSubmit)
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
