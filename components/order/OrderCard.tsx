import type { ReactNode } from 'react'
import { ChevronDown, MapPin, Truck } from 'lucide-react'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { OrderItems } from './OrderItems'
import { OrderProgress } from './OrderProgress'
import { formatOrderDate, formatOrderMoney, safeHttpsUrl } from '@/lib/orderFormat'
import type { GuestOrder, GuestOrderItem } from '@/types/order'

type Props = {
  order: GuestOrder
  /** Demo orders show the payment button without letting it go anywhere. */
  isDemo?: boolean
  /** Per-line buttons, passed through to OrderItems. The guest page has none. */
  itemActions?: (item: GuestOrderItem) => ReactNode
  /**
   * Folds the card down to its header (number, date, status, total) behind a
   * native <details>, so it works without JavaScript and is keyboard-operable.
   */
  collapsible?: boolean
  /** With `collapsible`, whether it starts open. */
  defaultOpen?: boolean
}

/** One sentence on where the order stands, from whatever dates it carries. */
function statusLine(order: GuestOrder): string {
  const eta = formatOrderDate(order.estimated_delivery)
  const delivered = formatOrderDate(order.delivered_at)

  switch (order.status) {
    case 'unpaid':
      return 'Awaiting payment. We start preparing your order as soon as it is paid.'
    case 'pending':
      return 'We have your order and are preparing it.'
    case 'paid':
      return 'Payment received. We are scheduling your delivery.'
    case 'shipped':
      return eta ? `On its way. Estimated delivery ${eta}.` : 'On its way.'
    case 'delivered':
      return delivered ? `Delivered ${delivered}.` : 'Delivered.'
    case 'cancelled':
      return 'This order was cancelled.'
    case 'refunded':
      return 'This order was refunded.'
    default:
      return ''
  }
}

const SUMMARY_ROW = 'flex justify-between gap-4 text-sm'
const SUMMARY_LABEL = 'text-theme-muted dark:text-gray-400'
const SUMMARY_VALUE = 'text-theme-dark dark:text-white'

export function OrderCard({ order, isDemo = false, itemActions, collapsible = false, defaultOpen = true }: Props) {
  const placed = formatOrderDate(order.created_at)
  const destination = [order.shipping_city, [order.shipping_province, order.shipping_zip_code].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')
  const trackingUrl = safeHttpsUrl(order.tracking_url)
  const paymentUrl = order.status === 'unpaid' ? safeHttpsUrl(order.payment_url) : null
  const hasDelivery = Boolean(destination || order.tracking_number)
  const hasBreakdown = [order.sub_total, order.total_shipping, order.total_tax].some((v) => v !== undefined)
  const status = statusLine(order)

  const heading = (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-theme-muted dark:text-gray-400">Order</p>
      <h2 className="text-base font-extrabold text-theme-dark dark:text-white">#{order.order_number}</h2>
      {placed && <p className="mt-0.5 text-xs text-theme-muted dark:text-gray-400">Placed {placed}</p>}
    </div>
  )

  const body = (
    <div className="flex flex-col gap-5 p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        {status && <p className="text-sm font-semibold text-theme-dark-2 dark:text-gray-200">{status}</p>}
        <OrderProgress status={order.status} />
      </div>

      <OrderItems items={order.items} itemActions={itemActions} />

      <div
        className={`grid gap-5 border-t border-theme-border pt-5 dark:border-gray-700 ${hasDelivery ? 'sm:grid-cols-2' : ''}`}
      >
        {hasDelivery && (
          <div className="flex flex-col gap-3 text-sm">
            {destination && (
              <p className="flex items-start gap-2 text-theme-dark-2 dark:text-gray-300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-theme-muted dark:text-gray-500" aria-hidden="true" />
                <span>
                  Delivering to <span className="font-semibold">{destination}</span>
                  {order.shipping_method && <span className="block text-xs text-theme-muted dark:text-gray-400">{order.shipping_method}</span>}
                </span>
              </p>
            )}
            {order.tracking_number && (
              <p className="flex items-start gap-2 text-theme-dark-2 dark:text-gray-300">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-theme-muted dark:text-gray-500" aria-hidden="true" />
                <span>
                  {order.tracking_carrier ? `${order.tracking_carrier} · ` : 'Tracking · '}
                  {trackingUrl ? (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-theme-primary underline underline-offset-2 hover:decoration-2 dark:text-red-400"
                    >
                      {order.tracking_number}
                    </a>
                  ) : (
                    <span className="font-semibold">{order.tracking_number}</span>
                  )}
                </span>
              </p>
            )}
          </div>
        )}

        <dl className="flex flex-col gap-1.5">
          {order.sub_total !== undefined && (
            <div className={SUMMARY_ROW}>
              <dt className={SUMMARY_LABEL}>Subtotal</dt>
              <dd className={SUMMARY_VALUE}>{formatOrderMoney(order.sub_total)}</dd>
            </div>
          )}
          {order.total_shipping !== undefined && (
            <div className={SUMMARY_ROW}>
              <dt className={SUMMARY_LABEL}>Delivery</dt>
              <dd className={SUMMARY_VALUE}>{formatOrderMoney(order.total_shipping)}</dd>
            </div>
          )}
          {order.total_tax !== undefined && (
            <div className={SUMMARY_ROW}>
              <dt className={SUMMARY_LABEL}>Tax</dt>
              <dd className={SUMMARY_VALUE}>{formatOrderMoney(order.total_tax)}</dd>
            </div>
          )}
          <div
            className={`${SUMMARY_ROW} items-baseline ${hasBreakdown ? 'mt-1 border-t border-theme-border pt-2 dark:border-gray-700' : ''}`}
          >
            <dt className="font-bold text-theme-dark dark:text-white">Total</dt>
            <dd className="text-base font-extrabold text-theme-dark dark:text-white">{formatOrderMoney(order.total_price)}</dd>
          </div>
        </dl>
      </div>

      {paymentUrl && (
        <div className="flex justify-end">
          {isDemo ? (
            <span
              aria-disabled="true"
              title="Disabled in the demo"
              className="cursor-not-allowed rounded-md bg-theme-primary px-6 py-2.5 text-sm font-semibold text-white opacity-90"
            >
              Complete payment
            </span>
          ) : (
            <a
              href={paymentUrl}
              rel="noopener noreferrer"
              className="rounded-md bg-theme-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-theme-primary-dark"
            >
              Complete payment
            </a>
          )}
        </div>
      )}
    </div>
  )

  const cardClass = 'rounded-lg border border-theme-border bg-theme-subtle dark:border-gray-700 dark:bg-gray-800'

  if (collapsible) {
    return (
      <details open={defaultOpen} className={`group ${cardClass}`}>
        <summary
          className="flex cursor-pointer list-none items-start justify-between gap-3 rounded-lg p-4 sm:p-5
                     group-open:rounded-b-none group-open:border-b group-open:border-theme-border dark:group-open:border-gray-700
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary
                     [&::-webkit-details-marker]:hidden"
        >
          {heading}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1.5">
              <OrderStatusBadge status={order.status} />
              {/* The total stays visible while folded; once open it is in the summary below. */}
              <span className="text-sm font-bold text-theme-dark group-open:hidden dark:text-white">
                {formatOrderMoney(order.total_price)}
              </span>
            </div>
            <ChevronDown
              className="h-5 w-5 shrink-0 text-theme-muted transition-transform group-open:rotate-180 dark:text-gray-400"
              aria-hidden="true"
            />
          </div>
        </summary>
        {body}
      </details>
    )
  }

  return (
    <article className={cardClass}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-theme-border p-4 sm:p-5 dark:border-gray-700">
        {heading}
        <OrderStatusBadge status={order.status} />
      </header>
      {body}
    </article>
  )
}
