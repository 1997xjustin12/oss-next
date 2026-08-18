'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { ADMIN_ROUTES } from '@/config/admin'
import { ROUTES } from '@/config/routes'
import { isAdminIdentity } from '@/lib/admin'
import { useAuth } from '@/hooks/useAuth'

// Downloads and Payment methods are intentionally not linked here — neither
// has a real backend behind it (no digital products, no stored payment
// methods API), so they're left as unlinked stub routes instead of being
// deleted outright. See docs/audits/AUDIT_REQUIREMENTS.md.
const NAV_ITEMS = [
  { href: ROUTES.ACCOUNT.ROOT, label: 'Dashboard' },
  { href: ROUTES.ACCOUNT.ORDERS, label: 'Orders' },
  { href: ROUTES.ACCOUNT.EDIT_ADDRESS, label: 'Addresses' },
  { href: ROUTES.ACCOUNT.NEWSLETTER, label: 'Newsletter' },
  { href: ROUTES.ACCOUNT.EDIT_ACCOUNT, label: 'Account Details' },
]

export function AccountSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Presentation only. Hiding this link protects nothing — /admin is gated in
  // the proxy, the layout and every admin action — it just spares the other
  // ~everyone a link that would 404 for them. The same allowlist is used so the
  // link and the gate cannot disagree about who should see it.
  const showAdmin = isAdminIdentity(user?.username, user?.email)

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
        {showAdmin && (
          <li>
            <Link
              href={ADMIN_ROUTES.ROOT}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-theme-dark-2 transition-colors
                         hover:bg-white/70 hover:text-theme-primary dark:text-gray-300 dark:hover:bg-gray-900/60 dark:hover:text-red-400"
            >
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Store Admin
            </Link>
          </li>
        )}
        <li>
          <Link
            href={ROUTES.ACCOUNT.LOGOUT}
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
