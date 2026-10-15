'use client'

import { RotateCcw, Star } from 'lucide-react'
import { OrderCard } from '@/components/order/OrderCard'
import { REORDERABLE, REVIEWABLE } from './compareDemoOrders'
import type { GuestOrder } from '@/types/order'

type Props = {
  order: GuestOrder
}

const ACTION = 'flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors dark:text-red-400'

/**
 * The order-status card with the order history's per-item actions merged in:
 * Buy Again on delivered, cancelled and refunded orders, Write / Edit Review
 * on delivered ones — the same rules as today. Inert in the preview.
 */
export function ProposedOrderCard({ order }: Props) {
  const canReorder = REORDERABLE.includes(order.status)
  const canReview = REVIEWABLE.includes(order.status)

  return (
    <OrderCard
      order={order}
      isDemo
      itemActions={
        canReorder || canReview
          ? () => (
              <>
                {canReorder && (
                  <button type="button" title="Disabled in the preview" className={ACTION}>
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Buy Again
                  </button>
                )}
                {canReview && (
                  <button type="button" title="Disabled in the preview" className={ACTION}>
                    <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    Write / Edit Review
                  </button>
                )}
              </>
            )
          : undefined
      }
    />
  )
}
