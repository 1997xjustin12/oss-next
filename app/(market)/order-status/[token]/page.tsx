import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ROUTES } from '@/config/routes'
import { SITE } from '@/config/site'
import { GuestOrders } from './_components/GuestOrders'
import { GuestOrdersSkeleton } from './_components/GuestOrdersSkeleton'

/**
 * Static on purpose: nothing about the token may reach the document head,
 * where crawlers, link previews and browser extensions read it. The canonical
 * is the bare path for the same reason.
 *
 * `noindex, nofollow` because every URL under here is one person's private
 * link. `referrer: no-referrer` backs up the header set in next.config.ts.
 */
export const metadata: Metadata = {
  title: 'Order Status',
  description: `Check the status of your ${SITE.name} orders.`,
  alternates: { canonical: ROUTES.ORDER_STATUS },
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
  openGraph: {
    title: 'Order Status',
    description: `Check the status of your ${SITE.name} orders.`,
    images: [SITE.logo],
  },
}

type Props = {
  params: Promise<{ token: string }>
}

/**
 * The guest order-status page, reached only from a link the backend emails.
 *
 * The shell renders statically; the orders stream in behind Suspense because
 * the token is runtime data and the lookup is never cached — see
 * getGuestOrders. No PageHeadScripts here: admin-configured scripts run with
 * the page's URL in reach, and this URL is a secret.
 *
 * Plan and open questions: docs/reference/guest-order-page.md.
 */
export default function OrderStatusPage({ params }: Props) {
  return (
    <div className="bg-white px-[5%] py-10 sm:py-14 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-theme-dark mb-2 dark:text-white">
          Order Status
        </h1>
        <p className="text-sm text-theme-muted mb-8 sm:mb-10 dark:text-gray-400">
          Your orders with {SITE.name} and where each one stands.
        </p>

        <Suspense fallback={<GuestOrdersSkeleton />}>
          <GuestOrders params={params} />
        </Suspense>
      </div>
    </div>
  )
}
