'use client'

import { useState } from 'react'
import { CurrentOrderCard } from './CurrentOrderCard'
import { ProposedOrderCard } from './ProposedOrderCard'
import { COMPARE_DEMO_ORDERS } from './compareDemoOrders'

type View = 'current' | 'proposed'

const VIEWS: { id: View; label: string; note: string }[] = [
  {
    id: 'current',
    label: 'Current',
    note: 'The order history as it is today: number, status, items with Buy Again and Review, and the total.',
  },
  {
    id: 'proposed',
    label: 'Proposed',
    note:
      'The order-status card with the order history’s Buy Again and Review kept: adds the date placed, a status ' +
      'sentence, a progress line, delivery and tracking, the cost breakdown, and Complete payment for unpaid orders.',
  },
]

/** Same sample orders, two designs, one toggle. */
export function OrdersCompare() {
  const [view, setView] = useState<View>('proposed')
  const active = VIEWS.find((v) => v.id === view) ?? VIEWS[0]
  const newestFirst = [...COMPARE_DEMO_ORDERS].sort(
    (a, b) => (Date.parse(b.created_at ?? '') || 0) - (Date.parse(a.created_at ?? '') || 0),
  )

  return (
    <div className="flex flex-col gap-5">
      <p className="rounded-md border border-dashed border-theme-border px-4 py-2.5 text-xs text-theme-muted dark:border-gray-700 dark:text-gray-400">
        Design preview with sample orders. Nothing here is a real order, and the buttons are disabled.
      </p>

      <div>
        <div
          role="tablist"
          aria-label="Design"
          className="inline-flex rounded-md border border-theme-border p-1 dark:border-gray-700"
        >
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={view === v.id}
              onClick={() => setView(v.id)}
              className={`rounded px-4 py-1.5 text-sm font-semibold transition-colors ${
                view === v.id
                  ? 'bg-theme-primary text-white'
                  : 'text-theme-dark-2 hover:text-theme-primary dark:text-gray-300 dark:hover:text-red-400'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-theme-muted dark:text-gray-400">{active.note}</p>
      </div>

      <div role="tabpanel" className="flex flex-col gap-5">
        {newestFirst.map((order) =>
          view === 'current' ? (
            <CurrentOrderCard key={order.order_number} order={order} />
          ) : (
            <ProposedOrderCard key={order.order_number} order={order} />
          ),
        )}
      </div>
    </div>
  )
}
