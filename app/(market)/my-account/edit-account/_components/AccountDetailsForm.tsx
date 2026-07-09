'use client'

import { useState, FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type FormState = {
  firstName: string
  lastName: string
  displayName: string
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function AccountDetailsForm() {
  const { user, token, login } = useAuth()
  const [form, setForm] = useState<FormState>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    displayName: user?.displayName ?? '',
    email: user?.email ?? '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
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
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    if (form.newPassword && !form.currentPassword) {
      setError('Enter your current password to set a new one.')
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
          ...(form.newPassword
            ? { currentPassword: form.currentPassword, newPassword: form.newPassword }
            : {}),
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Could not update account details.')

      login({ user: { ...user, ...data.user }, token })
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }))
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

        <div className="border-t border-theme-border pt-5 dark:border-gray-700">
          <p className="mb-4 text-sm font-semibold text-theme-dark dark:text-white">Password change</p>

          <div className="space-y-5">
            <div>
              <label htmlFor="acc-current-password" className={labelClass}>
                Current password
              </label>
              <input
                id="acc-current-password"
                type="password"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={(e) => update('currentPassword', e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="acc-new-password" className={labelClass}>
                  New password
                </label>
                <div className="relative">
                  <input
                    id="acc-new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.newPassword}
                    onChange={(e) => update('newPassword', e.target.value)}
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-theme-muted hover:text-theme-dark transition-colors dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="acc-confirm-password" className={labelClass}>
                  Confirm new password
                </label>
                <input
                  id="acc-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
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
