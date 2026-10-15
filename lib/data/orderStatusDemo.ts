import type { GuestOrder } from '@/types/order'

/**
 * `/order-status/demo` shows this order instead of asking the backend — a fixed
 * page for showing the design before real links are in hand.
 *
 * Not a uuid, so it can never collide with a real order's link. The page
 * labels it as sample data.
 *
 * A shipped order, since that state uses the most of the card: progress,
 * estimated delivery, tracking and the full cost breakdown. Prices, tax and
 * delivery are plausible, not quoted.
 */
export const ORDER_STATUS_DEMO_ID = 'demo'

export const DEMO_ORDER: GuestOrder = {
  order_number: 'OSS-10457',
  status: 'shipped',
  created_at: '2026-10-08T17:42:00Z',
  items: [
    {
      product_id: 'demo-1',
      title: "40' High Cube — New (One Trip)",
      image: '/images/containers/new-40ft-hc.webp',
      quantity: 1,
      price: '5450.00',
    },
    {
      product_id: 'demo-2',
      title: 'Container Lock Box',
      quantity: 1,
      price: '125.00',
    },
  ],
  sub_total: '5575.00',
  total_shipping: '595.00',
  total_tax: '432.06',
  total_price: '6602.06',
  shipping_method: 'Tilt-bed delivery',
  shipping_city: 'Riverside',
  shipping_province: 'CA',
  shipping_zip_code: '92501',
  estimated_delivery: '2026-10-17',
  tracking_carrier: 'On-Site Delivery',
  tracking_number: 'OSD-48213-77',
}
