import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { formatMoney } from '@/lib/formatters'
import type { GuestOrder } from '@/types/order'

type Props = {
  order: GuestOrder
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

function formatOrderDate(iso: string | undefined): string | null {
  if (!iso) return null
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : DATE_FORMAT.format(date)
}

/**
 * One order: number, date, status, item count and total.
 *
 * Items are counted rather than listed because the backend's order items carry
 * only `product_id`, `quantity` and `price` — showing names means a product
 * lookup, which is a follow-up in the plan.
 */
export function GuestOrderCard({ order }: Props) {
  const placed = formatOrderDate(order.created_at)
  const itemCount = order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) ?? 0

  return (
    <article className="rounded-lg border border-theme-border bg-theme-subtle p-4 sm:p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-theme-muted dark:text-gray-400">Order</p>
          <p className="text-base font-extrabold text-theme-dark dark:text-white">#{order.order_number}</p>
          {placed && <p className="mt-0.5 text-xs text-theme-muted dark:text-gray-400">Placed {placed}</p>}
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-theme-border pt-4 text-sm dark:border-gray-700">
        <div>
          <dt className="text-theme-muted dark:text-gray-400">Items</dt>
          <dd className="font-semibold text-theme-dark dark:text-white">{itemCount}</dd>
        </div>
        <div className="text-right">
          <dt className="text-theme-muted dark:text-gray-400">Total</dt>
          <dd className="font-semibold text-theme-dark dark:text-white">{formatMoney(order.total_price) || '—'}</dd>
        </div>
      </dl>
    </article>
  )
}
