'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/my-account', label: 'Dashboard' },
  { href: '/my-account/orders', label: 'Orders' },
  { href: '/my-account/downloads', label: 'Downloads' },
  { href: '/my-account/edit-address', label: 'Addresses' },
  { href: '/my-account/payment-methods', label: 'Payment methods' },
  { href: '/my-account/edit-account', label: 'Account Details' },
]

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Account"
      className="w-full shrink-0 overflow-hidden rounded-md border border-theme-border bg-theme-subtle lg:w-64
                 dark:border-gray-700 dark:bg-gray-800"
    >
      <ul className="divide-y divide-theme-border dark:divide-gray-700">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`block px-5 py-3 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-white text-theme-primary dark:bg-gray-900 dark:text-red-400'
                    : 'text-theme-dark-2 hover:bg-white/70 hover:text-theme-primary dark:text-gray-300 dark:hover:bg-gray-900/60 dark:hover:text-red-400'
                }`}
              >
                {label}
              </Link>
            </li>
          )
        })}
        <li>
          <Link
            href="/my-account/logout"
            className="block px-5 py-3 text-sm font-semibold text-theme-dark-2 transition-colors
                       hover:bg-white/70 hover:text-theme-primary dark:text-gray-300 dark:hover:bg-gray-900/60 dark:hover:text-red-400"
          >
            Logout
          </Link>
        </li>
      </ul>
    </nav>
  )
}
