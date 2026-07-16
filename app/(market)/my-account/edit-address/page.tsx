import type { Metadata } from 'next'
import { MapPinPlus } from 'lucide-react'
import { AccountPageShell } from '../_components/AccountPageShell'

const TITLE = 'Addresses'
const DESCRIPTION = 'Manage your billing and shipping addresses on On-Site Storage Solutions.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/my-account/edit-address' },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/images/logo/oss-logo.webp'] },
  robots: { index: false, follow: true },
}

const ADDRESS_TYPES = [
  {
    key: 'billing',
    label: 'Billing address',
    hint: 'The address used on your invoices and payment receipts.',
  },
  {
    key: 'shipping',
    label: 'Shipping address',
    hint: 'The default delivery address for your container orders.',
  },
]

export default function EditAddressPage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>

        <AccountPageShell title="Addresses">
          <p className="mb-5 max-w-2xl text-sm text-theme-muted dark:text-gray-400">
            The following addresses will be used on the checkout page by default.
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {ADDRESS_TYPES.map(({ key, label, hint }) => (
              <div
                key={key}
                className="rounded-md border border-theme-border bg-theme-subtle p-5 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-3 flex items-start gap-3">
                  <MapPinPlus className="mt-0.5 h-5 w-5 shrink-0 text-theme-muted dark:text-gray-500" />
                  <div>
                    <p className="font-semibold text-theme-dark dark:text-white">{label}</p>
                    <p className="text-xs text-theme-muted dark:text-gray-400">{hint}</p>
                  </div>
                </div>
                <p className="mb-4 text-sm text-theme-muted dark:text-gray-400">
                  You have not set up this type of address yet.
                </p>
                <button
                  type="button"
                  className="rounded-md border border-theme-border px-4 py-2 text-sm font-semibold text-theme-dark-2 transition-colors
                             hover:border-theme-primary hover:text-theme-primary dark:border-gray-600 dark:text-gray-300 dark:hover:border-red-400 dark:hover:text-red-400"
                >
                  Add address
                </button>
              </div>
            ))}
          </div>
        </AccountPageShell>
      </div>
    </div>
  )
}
