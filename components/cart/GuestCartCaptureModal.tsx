'use client'

import { useState, FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

type Props = {
  open: boolean
  onCapture: (email: string) => void
  onDismiss: () => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function GuestCartCaptureModal({ open, onCapture, onDismiss }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!EMAIL_PATTERN.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    onCapture(email)
  }

  return (
    <Modal open={open} onClose={onDismiss} title="Save your cart?" maxWidth="max-w-sm">
      <div>
        <div className="flex items-start gap-3 mb-4">
          <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-theme-primary-light dark:bg-red-950/30">
            <Mail className="w-4.5 h-4.5 text-theme-primary" />
          </div>
          <p className="text-sm text-theme-mid dark:text-gray-300">
            Your cart is saved here for now. Leave your email and we&apos;ll keep it ready for
            you, and can follow up if you need help finishing your order.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            placeholder="you@email.com"
            className="w-full rounded-md border border-theme-border bg-theme-subtle px-3.5 py-2.5 text-sm text-theme-dark
                       placeholder:text-theme-muted outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-colors
                       dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
          {error && <p className="text-xs text-theme-primary dark:text-red-400">{error}</p>}

          <button
            type="submit"
            className="rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-bold px-4 py-2.5 text-sm transition-colors"
          >
            Save my cart
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-theme-muted hover:text-theme-dark dark:hover:text-white underline text-center transition-colors"
          >
            No thanks
          </button>
        </form>
      </div>
    </Modal>
  )
}
