import { getGuestOrders } from '@/services/order.service'
import { GuestOrderCard } from './GuestOrderCard'
import { GuestOrdersNotice } from './GuestOrdersNotice'

type Props = {
  params: Promise<{ token: string }>
}

/**
 * Looks the token up and renders whichever of the four outcomes it gets.
 *
 * Server Component, so the token is only ever handled on the server — it is
 * not passed to any client component, and the page ships no JavaScript of its
 * own that could read it back out of the URL.
 */
export async function GuestOrders({ params }: Props) {
  const { token } = await params
  const result = await getGuestOrders(token)

  if (result.state === 'invalid') return <GuestOrdersNotice kind="invalid" />
  if (result.state === 'error') return <GuestOrdersNotice kind="error" />
  if (result.orders.length === 0) return <GuestOrdersNotice kind="empty" />

  return (
    <section aria-label="Your orders" className="flex flex-col gap-4">
      {result.orders.map((order) => (
        <GuestOrderCard key={order.order_number} order={order} />
      ))}
    </section>
  )
}
