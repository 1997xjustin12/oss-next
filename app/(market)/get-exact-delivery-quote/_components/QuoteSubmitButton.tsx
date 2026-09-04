'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

/**
 * The form's submit control, and the only client component on the page.
 *
 * It exists as its own file for exactly that reason: `useFormStatus` needs a
 * client component, and putting it here keeps the boundary at one button
 * instead of dragging the whole form across it.
 *
 * The disabled state is not decoration — this posts a lead to a Server Action,
 * and a double submit is a duplicate row in someone's sales queue.
 */
export function QuoteSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-theme-primary px-8 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-theme-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[260px] dark:focus-visible:ring-offset-neutral-900"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Sending your details
        </>
      ) : (
        <>
          Next: review quote
          <ArrowRight className="h-4 w-4" aria-hidden />
        </>
      )}
    </button>
  )
}
