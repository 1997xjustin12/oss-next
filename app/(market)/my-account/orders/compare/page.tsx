import type { Metadata } from 'next'
import { ROUTES } from '@/config/routes'
import { AccountLayout } from '../../_components/AccountLayout'
import { OrdersCompare } from './_components/OrdersCompare'

/**
 * Design preview: the order history's current cards next to the proposed ones,
 * on sample data. Temporary — delete this folder once a design is chosen.
 *
 * No login needed, since it shows no real data. Under /my-account, so it is
 * already disallowed for crawlers; noindex is restated here regardless.
 */
export const metadata: Metadata = {
  title: 'Orders — Design Preview',
  description: 'Comparison of the current and proposed order history designs, on sample data.',
  alternates: { canonical: `${ROUTES.ACCOUNT.ORDERS}/compare` },
  robots: { index: false, follow: false },
  openGraph: { images: ['/images/logo/oss-logo.webp'] },
}

export default function OrdersComparePage() {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-8 sm:mb-12 dark:text-white">
          My Account
        </h1>

        <AccountLayout>
          <h2 className="mb-5 text-xl font-bold text-theme-dark dark:text-white">Orders</h2>
          <OrdersCompare />
        </AccountLayout>
      </div>
    </div>
  )
}
