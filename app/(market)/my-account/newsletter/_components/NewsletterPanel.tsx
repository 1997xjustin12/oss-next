'use client'

import { useState } from 'react'
import { Mail, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { subscribeToNewsletter, unsubscribeFromNewsletter } from '@/lib/newsletter'

// Two states, subscribed / not-subscribed, with the matching action button.
//
// Caveat: the backend exposes only subscribe and unsubscribe (both POST) — no
// endpoint to READ a subscriber's current status, and the user profile carries
// no newsletter flag. So the displayed state reflects the last action taken
// here (remembered per-account in localStorage), not an authoritative read.
// It defaults to not-subscribed, which is the safe default: it never wrongly
// claims someone is subscribed, and both actions are idempotent on the backend.
// A real status read needs a backend GET endpoint — tracked in the audit.

type SubState = 'subscribed' | 'unsubscribed'

function storageKey(email: string): string {
  return `oss-newsletter:${email.toLowerCase()}`
}

export function NewsletterPanel() {
  const { user } = useAuth()
  const email = user?.email ?? ''

  const [state, setState] = useState<SubState>(() => {
    if (typeof window === 'undefined' || !email) return 'unsubscribed'
    return localStorage.getItem(storageKey(email)) === 'subscribed' ? 'subscribed' : 'unsubscribed'
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  const subscribed = state === 'subscribed'

  async function toggle(next: SubState) {
    if (!email) {
      setError('No email on your account.')
      return
    }
    setBusy(true)
    setError(null)
    setFlash(null)

    const result =
      next === 'subscribed'
        ? await subscribeToNewsletter(email)
        : await unsubscribeFromNewsletter(email)

    if (result.ok) {
      setState(next)
      localStorage.setItem(storageKey(email), next)
      setFlash(next === 'subscribed' ? 'You’re subscribed.' : 'You’ve been unsubscribed.')
    } else {
      setError(result.error)
    }
    setBusy(false)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-start gap-3 rounded-md border border-theme-border bg-theme-subtle p-5 dark:border-gray-700 dark:bg-gray-800/50">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            subscribed
              ? 'bg-theme-success-light dark:bg-green-950/40'
              : 'bg-white dark:bg-gray-900'
          }`}
        >
          {subscribed ? (
            <CheckCircle2 className="h-5 w-5 text-theme-success dark:text-green-400" />
          ) : (
            <Mail className="h-5 w-5 text-theme-muted dark:text-gray-400" />
          )}
        </div>

        <div className="min-w-0">
          <p className="font-bold text-theme-dark dark:text-white">
            {subscribed ? 'You’re subscribed' : 'You’re not subscribed'}
          </p>
          <p className="mt-0.5 text-sm text-theme-muted dark:text-gray-400">
            {subscribed
              ? 'You’ll receive container deals, guides, and updates at '
              : 'Subscribe to get container deals, guides, and updates at '}
            <span className="font-semibold text-theme-dark-2 dark:text-gray-300">
              {email || 'your email'}
            </span>
            .
          </p>
        </div>
      </div>

      {flash && (
        <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-theme-success dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {flash}
        </p>
      )}
      {error && (
        <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-theme-primary dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <div className="mt-5">
        {subscribed ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => toggle('unsubscribed')}
            className="inline-flex items-center gap-2 rounded-md border border-theme-border bg-white px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-theme-dark transition-colors hover:bg-theme-subtle disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Unsubscribe
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => toggle('subscribed')}
            className="inline-flex items-center gap-2 rounded-md bg-theme-primary px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-theme-primary-dark disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Subscribe
          </button>
        )}
      </div>
    </div>
  )
}
