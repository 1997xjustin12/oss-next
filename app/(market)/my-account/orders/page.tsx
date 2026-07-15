import type { Metadata } from 'next'
import { AccountPageShell } from '../_components/AccountPageShell'
import { OrdersList } from './_components/OrdersList'

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
          <OrdersList />
        </AccountPageShell>
      </div>
    </main>
  )
}
