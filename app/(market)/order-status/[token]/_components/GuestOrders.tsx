import { DEMO_GUEST_ORDERS, GUEST_ORDER_DEMO_TOKEN } from '@/lib/data/guestOrderDemo'
import { getGuestOrders } from '@/services/order.service'
import { getProductsByIds } from '@/services/search.service'
import { GuestOrderCard } from './GuestOrderCard'
import { GuestOrdersNotice } from './GuestOrdersNotice'
import type { GuestOrder, GuestOrdersResult } from '@/types/order'

type Props = {
  params: Promise<{ token: string }>
}

/**
 * Fills in name, image and link for any line the backend sent as a bare
 * `product_id`, from the product index — the same lookup the account's order
 * history uses. A product that is no longer published keeps no name, and the
 * card says so rather than guessing.
 */
async function withProductDetails(orders: GuestOrder[]): Promise<GuestOrder[]> {
  const missing = orders.flatMap((order) => order.items.filter((item) => !item.title).map((item) => item.product_id))
  if (missing.length === 0) return orders

  const products = await getProductsByIds(missing).catch(() => [])
  const byId = new Map(products.map((product) => [String(product.product_id), product]))

  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => {
      const product = item.title ? undefined : byId.get(String(item.product_id))
      return product
        ? { ...item, title: product.title, image: product.images?.[0]?.src, handle: product.handle }
        : item
    }),
  }))
}

function newestFirst(a: GuestOrder, b: GuestOrder): number {
  return (Date.parse(b.created_at ?? '') || 0) - (Date.parse(a.created_at ?? '') || 0)
}

/**
 * Looks the token up and renders whichever outcome it gets.
 *
 * Server Component, so the token is only ever handled on the server — it is
 * not passed to any client component, and the page ships no JavaScript of its
 * own that could read it back out of the URL.
 */
export async function GuestOrders({ params }: Props) {
  const { token } = await params
  const isDemo = token === GUEST_ORDER_DEMO_TOKEN

  const result: GuestOrdersResult = isDemo
    ? { state: 'ok', orders: DEMO_GUEST_ORDERS }
    : await getGuestOrders(token)

  if (result.state === 'invalid') return <GuestOrdersNotice kind="invalid" />
  if (result.state === 'error') return <GuestOrdersNotice kind="error" />
  if (result.orders.length === 0) return <GuestOrdersNotice kind="empty" />

  const orders = [...(await withProductDetails(result.orders))].sort(newestFirst)

  return (
    <section aria-label="Your orders" className="flex flex-col gap-5">
      {isDemo && (
        <p className="rounded-md border border-dashed border-theme-border px-4 py-2.5 text-xs text-theme-muted dark:border-gray-700 dark:text-gray-400">
          Sample orders for demonstration. Nothing on this page is a real order.
        </p>
      )}
      {orders.map((order) => (
        <GuestOrderCard key={order.order_number} order={order} isDemo={isDemo} />
      ))}
    </section>
  )
}
