import Image from 'next/image'
import { Package, RotateCcw, Star } from 'lucide-react'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { formatOrderMoney } from '@/lib/orderFormat'
import { REORDERABLE, REVIEWABLE } from './compareDemoOrders'
import type { GuestOrder } from '@/types/order'

type Props = {
  order: GuestOrder
}

/**
 * The live order history's card, as it renders today — copied from
 * OrdersList.tsx with the data fetching taken out, so it can show the sample
 * orders. Markup and classes are unchanged; the buttons do nothing here.
 */
export function CurrentOrderCard({ order }: Props) {
  const canReorder = REORDERABLE.includes(order.status)
  const canReview = REVIEWABLE.includes(order.status)

  return (
    <div className="rounded-lg border border-theme-border bg-white dark:border-gray-700 dark:bg-gray-900 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3 pb-3 border-b border-theme-border dark:border-gray-700">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-theme-muted dark:text-gray-400">Order</p>
          <p className="text-base font-extrabold text-theme-dark dark:text-white">#{order.order_number}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-3 mb-3">
        {order.items.map((item, itemIndex) => (
          <div key={`${item.product_id}-${itemIndex}`} className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="w-12 h-12 rounded-md bg-theme-subtle dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
              {item.image ? (
                <Image src={item.image} alt={item.title ?? ''} width={48} height={48} className="object-cover w-full h-full" />
              ) : (
                <Package className="w-5 h-5 text-theme-muted dark:text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate dark:text-white">{item.title ?? `Item #${item.product_id}`}</p>
              <p className="text-xs text-theme-muted dark:text-gray-400">
                Qty {item.quantity} · {formatOrderMoney(item.price)} each
              </p>
            </div>
            {(canReorder || canReview) && (
              <div className="flex w-full items-center gap-4 pl-15 sm:w-auto sm:pl-0">
                {canReorder && (
                  <button
                    type="button"
                    title="Disabled in the preview"
                    className="flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Buy Again
                  </button>
                )}
                {canReview && (
                  <button
                    type="button"
                    title="Disabled in the preview"
                    className="flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Write / Edit Review
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-theme-border dark:border-gray-700">
        <span className="text-sm font-semibold text-theme-muted dark:text-gray-400">Total</span>
        <span className="text-lg font-extrabold dark:text-white">{formatOrderMoney(order.total_price)}</span>
      </div>
    </div>
  )
}
