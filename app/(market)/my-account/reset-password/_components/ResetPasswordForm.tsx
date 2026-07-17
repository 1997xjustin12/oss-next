'use client'

import { useState, FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react'
import { ROUTES } from '@/config/routes'

const inputClass =
  'w-full rounded-md border border-theme-border bg-theme-subtle px-3.5 py-2.5 text-sm text-theme-dark ' +
  'placeholder:text-theme-muted outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-colors ' +
  'dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500'

const labelClass = 'block text-sm font-semibold text-theme-dark-2 mb-1.5 dark:text-gray-300'

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  visible: boolean
  onToggleVisible: () => void
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label} <span className="text-theme-primary dark:text-red-400">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-11`}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-theme-muted hover:text-theme-dark transition-colors dark:hover:text-gray-200"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const uidb64 = searchParams.get('uidb64')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!token || !uidb64) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-theme-primary/30 bg-theme-primary-light px-4 py-3.5 text-sm text-theme-primary
                       dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          This password reset link is invalid or has expired. Request a new one from the{' '}
          <Link href={ROUTES.ACCOUNT.LOST_PASSWORD} className="font-semibold underline underline-offset-2">
            Lost Password
          </Link>{' '}
          page.
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3.5 text-sm text-green-700
                       dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Your password has been reset.{' '}
          <Link href={ROUTES.ACCOUNT.ROOT} className="font-semibold underline underline-offset-2">
            Log in
          </Link>{' '}
          with your new password.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, uidb64, newPassword }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Could not reset password. The link may have expired.')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <p className="text-sm text-theme-muted mb-6 dark:text-gray-400">Enter a new password below.</p>

      {error && (
        <div className="mb-4 rounded-md border border-theme-primary/30 bg-theme-primary-light px-4 py-3 text-sm text-theme-primary
                        dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <PasswordField
          id="reset-new-password"
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          visible={showNewPassword}
          onToggleVisible={() => setShowNewPassword((v) => !v)}
        />
        <PasswordField
          id="reset-confirm-password"
          label="Re-enter new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          visible={showConfirmPassword}
          onToggleVisible={() => setShowConfirmPassword((v) => !v)}
        />

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-2.5 text-sm
                       transition-colors disabled:cursor-not-allowed disabled:opacity-60
                       focus:outline-none focus:ring-2 focus:ring-theme-primary/40 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
