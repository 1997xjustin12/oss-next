'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/config/routes'
import type { AuthSession } from '@/types/user'

type Props = {
  showTitle?: boolean
  className?: string
}

export function LoginForm({ showTitle = true, className = '' }: Props) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all required fields.')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Login failed.')
      login(data as AuthSession)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={className}>
      {showTitle && (
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-theme-dark mb-6 dark:text-white">
          Login
        </h2>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-theme-primary/30 bg-theme-primary-light px-4 py-3 text-sm text-theme-primary
                         dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="login-email" className="block text-sm font-semibold text-theme-dark-2 mb-1.5 dark:text-gray-300">
            Email address <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-theme-border bg-theme-subtle px-3.5 py-2.5 text-sm text-theme-dark
                       placeholder:text-theme-muted outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-colors
                       dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-semibold text-theme-dark-2 mb-1.5 dark:text-gray-300">
            Password <span className="text-theme-primary dark:text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-theme-border bg-theme-subtle px-3.5 py-2.5 pr-11 text-sm text-theme-dark
                         placeholder:text-theme-muted outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 transition-colors
                         dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              placeholder="••••••••"
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

        <div className="flex items-center justify-between pt-1 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-2.5 text-sm
                         transition-colors disabled:cursor-not-allowed disabled:opacity-60
                         focus:outline-none focus:ring-2 focus:ring-theme-primary/40 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>

            <label
              htmlFor="remember-me"
              className="flex items-center gap-1.5 text-sm text-theme-muted cursor-pointer select-none dark:text-gray-400"
            >
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-theme-border text-theme-primary focus:ring-theme-primary dark:border-gray-600 dark:bg-gray-800"
              />
              Remember me
            </label>
          </div>
        </div>

        <div>
          <Link href={ROUTES.ACCOUNT.LOST_PASSWORD} className="text-sm font-semibold text-theme-primary hover:underline dark:text-red-400">
            Lost your password?
          </Link>
        </div>
      </form>
    </div>
  )
}
