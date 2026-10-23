import type { ReactNode } from 'react'
import Image from 'next/image'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { Package } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { formatOrderMoney } from '@/lib/orderFormat'
import type { GuestOrderItem } from '@/types/order'

type Props = {
  items: GuestOrderItem[]
  /**
   * Per-line buttons (Buy Again, Write a Review on the account page). Shown on
   * their own row under the line, so an order of several items never has a
   * row of identical buttons with no way to tell which product each one is for.
   */
  itemActions?: (item: GuestOrderItem) => ReactNode
}

/** The order's lines: picture, name (linked when the product is still listed), quantity and price. */
export function OrderItems({ items, itemActions }: Props) {
  return (
    <ul className="divide-y divide-theme-border dark:divide-gray-700">
      {items.map((item, index) => {
        const quantity = Number(item.quantity) || 0
        const lineTotal = (Number(item.price) || 0) * quantity
        const title = item.title ?? 'No longer available'
        const actions = itemActions?.(item)

        return (
          <li key={`${item.product_id}-${index}`} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 first:pt-0 last:pb-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-theme-border bg-white dark:border-gray-700 dark:bg-gray-900">
              {item.image ? (
                <Image src={item.image} alt={title} width={56} height={56} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-6 w-6 text-theme-muted dark:text-gray-500" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {item.handle ? (
                <Link
                  href={ROUTES.PRODUCT(item.handle)}
                  className="line-clamp-2 text-sm font-semibold text-theme-dark hover:text-theme-primary dark:text-white dark:hover:text-red-400"
                >
                  {title}
                </Link>
              ) : (
                <p className="line-clamp-2 text-sm font-semibold text-theme-dark dark:text-white">{title}</p>
              )}
              <p className="text-xs text-theme-muted dark:text-gray-400">
                Qty {quantity} × {formatOrderMoney(item.price)}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-theme-dark dark:text-white">{formatOrderMoney(lineTotal)}</p>
            {actions && <div className="flex w-full flex-wrap items-center gap-4 pl-[68px]">{actions}</div>}
          </li>
        )
      })}
    </ul>
  )
}
