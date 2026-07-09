'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Info } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { AuthSession, RegisterPayload } from '@/types/user'

type Props = {
  showTitle?: boolean
  showBenefits?: boolean
  className?: string
}

type RegisterFormState = RegisterPayload & { confirmPassword: string; acceptedTerms: boolean }

const BENEFITS = [
  'Access to Live Inventory',
  'Exclusive Discounts and Promotions',
  'Inventory Email Updates',
  'Dedicated Account Representative',
]

const INITIAL_STATE: RegisterFormState = {
  firstName: '',
  lastName: '',
  contactNumber: '',
  companyName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
}

export function RegisterForm({ showTitle = true, showBenefits = true, className = '' }: Props) {
  const { login } = useAuth()
  const [form, setForm] = useState<RegisterFormState>(INITIAL_STATE)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [notRobot, setNotRobot] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const { firstName, lastName, contactNumber, email, password, confirmPassword, acceptedTerms } = form

    if (!firstName || !lastName || !contactNumber || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!notRobot) {
      setError('Please verify that you are not a robot.')
      return
    }
    if (!acceptedTerms) {
      setError('You must accept the terms & conditions to continue.')
      return
    }

    try {
      setIsSubmitting(true)
      const payload: RegisterPayload = {
        firstName: form.firstName,
        lastName: form.lastName,
        contactNumber: form.contactNumber,
        companyName: form.companyName,
        email: form.email,
        password: form.password,
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Registration failed.')
      login(data as AuthSession)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
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
    <div className={className}>
      {showTitle && (
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-theme-dark mb-6 dark:text-white">
          Register
        </h2>
      )}

      {showBenefits && (
        <div className="mb-6 rounded-md border border-theme-border bg-theme-subtle p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-semibold text-theme-dark mb-2 dark:text-white">Benefits Of Registration</p>
          <ul className="space-y-1 pl-4 text-sm text-theme-dark-2 list-disc marker:text-theme-primary dark:text-gray-300 dark:marker:text-red-400">
            {BENEFITS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-theme-primary/30 bg-theme-primary-light px-4 py-3 text-sm text-theme-primary
                         dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="reg-first-name" className={labelClass}>
              First Name <span className="text-theme-primary dark:text-red-400">*</span>
            </label>
            <input
              id="reg-first-name"
              type="text"
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="reg-last-name" className={labelClass}>
              Last Name <span className="text-theme-primary dark:text-red-400">*</span>
            </label>
            <input
              id="reg-last-name"
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
          <label htmlFor="reg-contact" className="flex items-center gap-1.5 text-sm font-semibold text-theme-dark-2 mb-1.5 dark:text-gray-300">
            Contact Number <span className="text-theme-primary dark:text-red-400">*</span>
            <span className="group relative inline-flex">
              <Info size={13} className="text-theme-muted cursor-help dark:text-gray-400" />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 w-48 -translate-x-1/2 rounded-md
                           bg-theme-dark px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity
                           group-hover:opacity-100 dark:bg-gray-700"
              >
                Include country code, e.g. +1 555 123 4567
              </span>
            </span>
          </label>
          <input
            id="reg-contact"
            type="tel"
            required
            autoComplete="tel"
            value={form.contactNumber}
            onChange={(e) => update('contactNumber', e.target.value)}
            className={inputClass}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label htmlFor="reg-company" className={labelClass}>
            Company Name
          </label>
          <input
            id="reg-company"
            type="text"
            autoComplete="organization"
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="reg-email" className={labelClass}>
            Email address <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="reg-password" className={labelClass}>
            Password <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
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
          <label htmlFor="reg-confirm-password" className={labelClass}>
            Confirm password <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-theme-muted hover:text-theme-dark transition-colors dark:hover:text-gray-200"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* reCAPTCHA placeholder — swap for a real widget (e.g. react-google-recaptcha) on integration */}
        <div className="flex w-full max-w-76 items-center justify-between gap-3 rounded-md border border-theme-border bg-theme-subtle px-3.5 py-3 dark:border-gray-700 dark:bg-gray-800">
          <label className="flex items-center gap-2.5 text-sm text-theme-dark cursor-pointer select-none dark:text-gray-200">
            <input
              type="checkbox"
              checked={notRobot}
              onChange={(e) => setNotRobot(e.target.checked)}
              className="h-5 w-5 rounded border-theme-border text-theme-primary focus:ring-theme-primary dark:border-gray-600 dark:bg-gray-700"
            />
            I&apos;m not a robot
          </label>
          <span className="text-[10px] leading-tight text-theme-muted dark:text-gray-500">reCAPTCHA</span>
        </div>

        <label className="flex items-start gap-2 text-sm text-theme-muted cursor-pointer select-none dark:text-gray-400">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={(e) => update('acceptedTerms', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-theme-border text-theme-primary focus:ring-theme-primary dark:border-gray-600 dark:bg-gray-800"
          />
          <span>
            I&apos;ve read and accept the{' '}
            <Link href="/terms-and-conditions" className="text-theme-primary hover:underline dark:text-red-400">
              terms &amp; conditions
            </Link>{' '}
            <span className="text-theme-primary dark:text-red-400">*</span>
          </span>
        </label>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-2.5 text-sm
                       transition-colors disabled:cursor-not-allowed disabled:opacity-60
                       focus:outline-none focus:ring-2 focus:ring-theme-primary/40 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {isSubmitting ? 'Creating account…' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  )
}
