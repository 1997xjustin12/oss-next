import { OrderCard } from '@/components/order/OrderCard'
import { DEMO_ORDER, ORDER_STATUS_DEMO_ID } from '@/lib/data/orderStatusDemo'
import { getOrderStatus } from '@/services/order.service'
import { getProductsByIds } from '@/services/search.service'
import { OrderStatusNotice } from './OrderStatusNotice'
import type { GuestOrder, OrderStatusResult } from '@/types/order'

type Props = {
  params: Promise<{ order_uuid: string }>
}

/**
 * Fills in name, image and link for any line that arrived as a bare
 * `product_id`, from the product index — the same lookup the account's order
 * history uses. A product no longer published keeps no name, and the card says
 * so rather than guessing.
 */
async function withProductDetails(order: GuestOrder): Promise<GuestOrder> {
  const missing = order.items.filter((item) => !item.title).map((item) => item.product_id)
  if (missing.length === 0) return order

  const products = await getProductsByIds(missing).catch(() => [])
  const byId = new Map(products.map((product) => [String(product.product_id), product]))

  return {
    ...order,
    items: order.items.map((item) => {
      const product = item.title ? undefined : byId.get(String(item.product_id))
      return product
        ? { ...item, title: product.title, image: product.images?.[0]?.src, handle: product.handle }
        : item
    }),
  }
}

/**
 * Looks the order up by uuid and renders it, or says why it can't.
 *
 * Server Component, so the uuid is only ever handled on the server — it is not
 * passed to any client component.
 */
export async function OrderStatusView({ params }: Props) {
  const { order_uuid: orderUuid } = await params
  const isDemo = orderUuid === ORDER_STATUS_DEMO_ID

  const result: OrderStatusResult = isDemo ? { state: 'ok', order: DEMO_ORDER } : await getOrderStatus(orderUuid)

  if (result.state === 'not_found') return <OrderStatusNotice kind="not_found" />
  if (result.state === 'error') return <OrderStatusNotice kind="error" />

  const order = await withProductDetails(result.order)

  return (
    <section aria-label="Your order" className="flex flex-col gap-5">
      {isDemo && (
        <p className="rounded-md border border-dashed border-theme-border px-4 py-2.5 text-xs text-theme-muted dark:border-gray-700 dark:text-gray-400">
          Sample order for demonstration. Nothing on this page is a real order.
        </p>
      )}
      <OrderCard order={order} isDemo={isDemo} />
    </section>
  )
}
