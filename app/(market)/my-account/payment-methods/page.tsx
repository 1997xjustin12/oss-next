import type { Metadata } from 'next'
import { CreditCard } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { AccountPageShell } from '../_components/AccountPageShell'

const TITLE = 'Payment Methods'
const DESCRIPTION = 'Manage your saved payment methods on On-Site Storage Solutions.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: ROUTES.ACCOUNT.PAYMENT_METHODS },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/images/logo/oss-logo.webp'] },
  robots: { index: false, follow: true },
}

export default function PaymentMethodsPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>

        <AccountPageShell title="Payment methods">
          <div
            className="flex flex-col items-center gap-3 rounded-md border border-theme-border bg-theme-subtle px-6 py-12 text-center
                       dark:border-gray-700 dark:bg-gray-800"
          >
            <CreditCard className="h-8 w-8 text-theme-muted dark:text-gray-500" />
            <p className="text-sm text-theme-muted dark:text-gray-400">No saved payment methods found.</p>
            <button
              type="button"
              className="mt-2 rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-5 py-2.5 text-sm transition-colors"
            >
              Add payment method
            </button>
          </div>
        </AccountPageShell>
      </div>
    </div>
  )
}
