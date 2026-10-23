'use client'

import { useEffect, useState, FormEvent } from 'react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { Eye, EyeOff } from 'lucide-react'
import { SITE } from '@/config/site'
import { useAuth } from '@/hooks/useAuth'
import { getRecaptchaToken, preloadRecaptcha } from '@/lib/recaptchaClient'
import type { AuthSession, RegisterPayload } from '@/types/user'

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

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

/**
 * The backend allows letters, numbers and underscores at any length, and
 * refuses a dot. On top of that this app asks for 3-20 characters and a letter
 * or number first, which is what USERNAME_RULES tells the customer. Consecutive
 * underscores are only discouraged, so they are not checked.
 */
const USERNAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_]{2,19}$/

const USERNAME_RULES = [
  'Must be 3-20 characters long.',
  'Can contain letters, numbers, or underscores (_).',
  'Must start with a letter or number.',
  'No spaces or special characters (like -, @, #, !, ., etc.).',
  'Avoid consecutive underscores for best readability (e.g., prefer john_doe over john__doe).',
]

const INITIAL_STATE: RegisterFormState = {
  username: '',
  firstName: '',
  lastName: '',
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load the script while the form is being filled, not at submit: v3 scores
  // on observed behaviour, and a script that arrives at the click has seen
  // nothing. The token itself is still minted at submit.
  useEffect(() => {
    if (RECAPTCHA_SITE_KEY) preloadRecaptcha(RECAPTCHA_SITE_KEY)
  }, [])

  const update = <K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const { username, firstName, lastName, email, password, confirmPassword, acceptedTerms } = form

    if (!username || !firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.')
      return
    }
    if (!USERNAME_PATTERN.test(username.trim())) {
      setError('Please choose a username that follows the rules below the username field.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!acceptedTerms) {
      setError('You must accept the terms & conditions to continue.')
      return
    }

    try {
      setIsSubmitting(true)

      /**
       * Fetched here, not held in state: a v3 token lasts about two
       * minutes, so one taken when the form appeared would already have
       * expired for anyone who typed slowly. Nothing is shown for this —
       * v3 scores the visitor invisibly.
       */
      const recaptchaToken = RECAPTCHA_SITE_KEY
        ? await getRecaptchaToken(RECAPTCHA_SITE_KEY, 'register')
        : null

      const payload: RegisterPayload & { recaptchaToken?: string | null } = {
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        recaptchaToken,
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
            placeholder="First name"
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
            placeholder="Last name"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className={labelClass}>
            Email <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass}
            placeholder="Email"
          />
        </div>

        <div>
          <label htmlFor="reg-username" className={labelClass}>
            Username <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <input
            id="reg-username"
            type="text"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            aria-describedby="reg-username-rules"
            value={form.username}
            onChange={(e) => update('username', e.target.value)}
            className={inputClass}
            placeholder="Username"
          />
          <div id="reg-username-rules" className="mt-3 text-sm text-theme-dark-2 dark:text-gray-300">
            <p className="mb-2">Follow these rules when choosing a username.</p>
            <ul className="space-y-1 pl-4 list-disc marker:text-theme-primary dark:marker:text-red-400">
              {USERNAME_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
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
              placeholder="Password"
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
            Confirm Password <span className="text-theme-primary dark:text-red-400">*</span>
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
              placeholder="Confirm password"
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

        {/*
          Nothing rendered for reCAPTCHA: v3 is invisible and shows its
          own floating badge. The token is fetched in handleSubmit.
        */}

        <label className="flex items-start gap-2 text-sm text-theme-muted cursor-pointer select-none dark:text-gray-400">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={(e) => update('acceptedTerms', e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-theme-border text-theme-primary focus:ring-theme-primary dark:border-gray-600 dark:bg-gray-800"
          />
          <span>
            <span className="text-theme-primary dark:text-red-400">*</span> By checking this box, I agree to{' '}
            {SITE.name}&apos;s{' '}
            <Link href="/terms-and-conditions" className="text-theme-primary hover:underline dark:text-red-400">
              Terms and conditions
            </Link>
            , and{' '}
            <Link href="/privacy-policy" className="text-theme-primary hover:underline dark:text-red-400">
              Privacy policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-2.5 text-sm
                     transition-colors disabled:cursor-not-allowed disabled:opacity-60
                     focus:outline-none focus:ring-2 focus:ring-theme-primary/40 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          {isSubmitting ? 'Creating Account…' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
