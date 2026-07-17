'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { ROUTES } from '@/config/routes'

export function LostPasswordForm() {
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!value) {
      setError('Please enter your username or email address.')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/auth/lost-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: value }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Could not send reset link. Please try again.')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset link. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div>
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3.5 text-sm font-semibold text-green-700
                        dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Password reset email has been sent.
        </div>
        <p className="mt-4 text-sm text-theme-muted dark:text-gray-400">
          A password reset email has been sent to the email address on file for your account, but may take several
          minutes to show up in your inbox. Please wait at least 10 minutes before attempting another reset.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-theme-dark mb-2 dark:text-white">Lost your password?</h2>
      <p className="text-sm text-theme-muted mb-6 dark:text-gray-400">
        Please enter your username or email address. You will receive a link to create a new password via email.
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-theme-primary/30 bg-theme-primary-light px-4 py-3 text-sm text-theme-primary
                         dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="lost-password-identifier" className="block text-sm font-semibold text-theme-dark-2 mb-1.5 dark:text-gray-300">
            Username or email <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <input
            id="lost-password-identifier"
            type="text"
            required
            autoComplete="username"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-md border border-theme-border bg-theme-subtle px-3.5 py-2.5 text-sm text-theme-dark
                       placeholder:text-theme-muted outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-colors
                       dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-2.5 text-sm
                       transition-colors disabled:cursor-not-allowed disabled:opacity-60
                       focus:outline-none focus:ring-2 focus:ring-theme-primary/40 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {isSubmitting ? 'Sending…' : 'Reset password'}
          </button>

          <Link href={ROUTES.ACCOUNT.ROOT} className="text-sm font-semibold text-theme-primary hover:underline dark:text-red-400">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  )
}
