'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import type { Dropin, PaymentMethodPayload } from 'braintree-web-drop-in'

export type BraintreeDropInHandle = {
  requestPaymentMethod: () => Promise<PaymentMethodPayload>
}

type Status = 'loading' | 'ready' | 'unavailable'

type Props = {
  onStatusChange?: (status: Status) => void
}

// Card payment UI, mounted via Braintree's Drop-in SDK. Fetches its own
// client token from /api/braintree_token — until BRAINTREE_MERCHANT_ID/
// PUBLIC_KEY/PRIVATE_KEY are set in .env.local that call fails with a clear
// error, which this renders as an inline "not available yet" notice instead
// of breaking the page.
export const BraintreeDropIn = forwardRef<BraintreeDropInHandle, Props>(function BraintreeDropIn(
  { onStatusChange },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<Dropin | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const onStatusChangeRef = useRef(onStatusChange)
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  useImperativeHandle(ref, () => ({
    requestPaymentMethod: () => {
      if (!instanceRef.current) {
        return Promise.reject(new Error('Payment form is not ready yet.'))
      }
      return instanceRef.current.requestPaymentMethod()
    },
  }))

  useEffect(() => {
    let cancelled = false

    async function init() {
      const res = await fetch('/api/braintree_token').catch(() => null)
      const data = await res?.json().catch(() => null)

      if (cancelled) return

      if (!res?.ok || !data?.clientToken) {
        setStatus('unavailable')
        setMessage(data?.error ?? 'Card payment is not available yet.')
        return
      }

      if (!containerRef.current) return

      const { create } = await import('braintree-web-drop-in')
      const instance = await create({
        authorization: data.clientToken,
        container: containerRef.current,
        card: { cardholderName: { required: false } },
      }).catch((err: unknown) => {
        setStatus('unavailable')
        setMessage(err instanceof Error ? err.message : 'Could not load the payment form.')
        return null
      })

      if (!instance) return

      if (cancelled) {
        instance.teardown().catch(() => {})
        return
      }

      instanceRef.current = instance
      setStatus('ready')
    }

    init()

    return () => {
      cancelled = true
      instanceRef.current?.teardown().catch(() => {})
      instanceRef.current = null
    }
  }, [])

  useEffect(() => {
    onStatusChangeRef.current?.(status)
  }, [status])

  return (
    <div>
      {status === 'loading' && (
        <div className="flex items-center gap-2.5 rounded-md border border-theme-border bg-theme-subtle px-4 py-6 text-sm text-theme-muted dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          Loading payment form…
        </div>
      )}

      {status === 'unavailable' && (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0 wrap-break-word">{message}</span>
        </div>
      )}

      <div ref={containerRef} className={status === 'ready' ? 'block' : 'hidden'} />
    </div>
  )
})
