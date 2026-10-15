import type { OrderStatus } from '@/types/order'

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  // Orange rather than Pending's amber: these are adjacent states and a
  // customer scanning the list should be able to tell "we owe you nothing yet"
  // from "we have it in hand" without reading the word.
  unpaid:    { label: 'Unpaid',    className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50' },
  pending:   { label: 'Pending',   className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50' },
  paid:      { label: 'Paid',      className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50' },
  shipped:   { label: 'Shipped',   className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50' },
  delivered: { label: 'Delivered', className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/50' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' },
  refunded:  { label: 'Refunded',  className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50' },
}

type Props = {
  status: OrderStatus
}

/**
 * An order's status as a coloured pill. Shared by the account's order history
 * and the guest order-status page, so a status reads the same on both.
 */
export function OrderStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-300' }
  return (
    <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${config.className}`}>
      {config.label}
    </span>
  )
}
