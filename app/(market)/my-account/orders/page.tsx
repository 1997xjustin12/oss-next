import type { Metadata } from 'next'
import Link from 'next/link'
import { PackageSearch } from 'lucide-react'
import { AccountPageShell } from '../_components/AccountPageShell'

const TITLE = 'Orders'
const DESCRIPTION = 'View your recent orders with On-Site Storage Solutions.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/my-account/orders' },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/images/logo/oss-logo.webp'] },
  robots: { index: false, follow: true },
}

export default function OrdersPage() {
  return (
    <main className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>

        <AccountPageShell title="Orders">
          <div
            className="flex flex-col items-center gap-3 rounded-md border border-theme-border bg-theme-subtle px-6 py-12 text-center
                       dark:border-gray-700 dark:bg-gray-800"
          >
            <PackageSearch className="h-8 w-8 text-theme-muted dark:text-gray-500" />
            <p className="text-sm text-theme-muted dark:text-gray-400">No order has been made yet.</p>
            <Link
              href="/sale-shipping-containers"
              className="mt-2 rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-5 py-2.5 text-sm transition-colors"
            >
              Browse Containers
            </Link>
          </div>
        </AccountPageShell>
      </div>
    </main>
  )
}
