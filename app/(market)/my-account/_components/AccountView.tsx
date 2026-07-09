'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { AccountLayout } from './AccountLayout'
import { LoginForm } from './auth/LoginForm'
import { RegisterForm } from './auth/RegisterForm'

export function AccountView() {
  const { user, isAuthenticated, logout } = useAuth()

  if (isAuthenticated && user) {
    const displayName = user.displayName ?? user.username

    return (
      <AccountLayout>
        <p className="text-sm sm:text-base">
          <span className="text-theme-muted dark:text-gray-400">Hello </span>
          <strong className="font-bold text-theme-dark dark:text-white">{displayName}</strong>
          <span className="text-theme-muted dark:text-gray-400"> (not </span>
          <strong className="font-bold text-theme-dark dark:text-white">{displayName}</strong>
          <span className="text-theme-muted dark:text-gray-400">? </span>
          <button
            type="button"
            onClick={logout}
            className="font-semibold text-theme-primary hover:underline dark:text-red-400"
          >
            Log out
          </button>
          <span className="text-theme-muted dark:text-gray-400">)</span>
        </p>

        <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-theme-muted dark:text-gray-400">
          From your account dashboard you can view your{' '}
          <Link href="/my-account/orders" className="font-medium text-theme-primary hover:underline dark:text-red-400">
            recent orders
          </Link>
          , manage your{' '}
          <Link href="/my-account/edit-address" className="font-medium text-theme-primary hover:underline dark:text-red-400">
            shipping and billing addresses
          </Link>
          , and{' '}
          <Link
            href="/my-account/edit-account"
            className="font-medium text-theme-primary hover:underline dark:text-red-400"
          >
            edit your password and account details
          </Link>
          .
        </p>
      </AccountLayout>
    )
  }

  return (
    <div
      className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16
                 divide-y divide-theme-border lg:divide-y-0 lg:divide-x
                 dark:divide-gray-700"
    >
      <section className="pb-10 lg:pb-0">
        <LoginForm />
      </section>
      <section className="pt-10 lg:pt-0 lg:pl-16">
        <RegisterForm />
      </section>
    </div>
  )
}
