import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ROUTES } from '@/config/routes'
import { SITE } from '@/config/site'
import { OrderStatusView } from './_components/OrderStatusView'
import { OrderStatusSkeleton } from './_components/OrderStatusSkeleton'

/**
 * Static on purpose: nothing about the order uuid may reach the document head,
 * where crawlers, link previews and browser extensions read it. The canonical
 * is the bare path for the same reason.
 *
 * `noindex, nofollow` because every URL under here is one person's private
 * link. `referrer: no-referrer` backs up the header set in next.config.ts.
 */
export const metadata: Metadata = {
  title: 'Order Status',
  description: `Check the status of your ${SITE.name} order.`,
  alternates: { canonical: ROUTES.ORDER_STATUS },
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
  openGraph: {
    title: 'Order Status',
    description: `Check the status of your ${SITE.name} order.`,
    images: [SITE.logo],
  },
}

type Props = {
  params: Promise<{ order_uuid: string }>
}

/**
 * One order's status page, `/order-status/<order_uuid>`. The uuid comes with
 * the order in the checkout response and is in the links of the order emails.
 *
 * The shell renders statically; the order streams in behind Suspense because
 * the uuid is runtime data and the lookup is never cached — see
 * getOrderStatus. No PageHeadScripts here: admin-configured scripts run with
 * the page's URL in reach, and the uuid in it is the customer's key.
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
          Your order with {SITE.name} and where it stands.
        </p>

        <Suspense fallback={<OrderStatusSkeleton />}>
          <OrderStatusView params={params} />
        </Suspense>
      </div>
    </div>
  )
}
