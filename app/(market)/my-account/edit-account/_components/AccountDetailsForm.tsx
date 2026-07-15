'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'

type FormState = {
  firstName: string
  lastName: string
  displayName: string
  email: string
}

export function AccountDetailsForm() {
  const { user, token, login } = useAuth()
  const [form, setForm] = useState<FormState>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    displayName: user?.displayName ?? '',
    email: user?.email ?? '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!form.firstName || !form.lastName || !form.email) {
      setError('Please fill in all required fields.')
      return
    }
    if (!token || !user) {
      setError('You must be logged in to update your account.')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/auth/account-details', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          displayName: form.displayName || undefined,
          email: form.email,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Could not update account details.')

      login({ user: { ...user, ...data.user }, token })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update account details. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-theme-border bg-theme-subtle px-3.5 py-2.5 text-sm text-theme-dark ' +
    'placeholder:text-theme-muted outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-colors ' +
    'dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500'

  const labelClass = 'block text-sm font-semibold text-theme-dark-2 mb-1.5 dark:text-gray-300'

  return (
    <div className="max-w-xl">
      {success && (
        <div
          className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700
                      dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400"
        >
          Account details updated.
        </div>
      )}

      {error && (
        <div
          className="mb-4 rounded-md border border-theme-primary/30 bg-theme-primary-light px-4 py-3 text-sm text-theme-primary
                      dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="acc-first-name" className={labelClass}>
              First name <span className="text-theme-primary dark:text-red-400">*</span>
            </label>
            <input
              id="acc-first-name"
              type="text"
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="acc-last-name" className={labelClass}>
              Last name <span className="text-theme-primary dark:text-red-400">*</span>
            </label>
            <input
              id="acc-last-name"
              type="text"
              required
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="acc-display-name" className={labelClass}>
            Display name
          </label>
          <input
            id="acc-display-name"
            type="text"
            value={form.displayName}
            onChange={(e) => update('displayName', e.target.value)}
            className={inputClass}
            placeholder="How your name appears on the site"
          />
        </div>

        <div>
          <label htmlFor="acc-email" className={labelClass}>
            Email address <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <input
            id="acc-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-2.5 text-sm
                       transition-colors disabled:cursor-not-allowed disabled:opacity-60
                       focus:outline-none focus:ring-2 focus:ring-theme-primary/40 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
