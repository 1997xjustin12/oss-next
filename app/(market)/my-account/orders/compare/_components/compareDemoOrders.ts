import { DEMO_GUEST_ORDERS } from '@/lib/data/guestOrderDemo'
import type { GuestOrder, OrderStatus } from '@/types/order'

/**
 * The guest demo's three orders, plus a cancelled one so "Buy Again" shows on
 * more than the delivered order. Same data in both designs, so the comparison
 * is of the presentation alone.
 */
export const COMPARE_DEMO_ORDERS: GuestOrder[] = [
  ...DEMO_GUEST_ORDERS,
  {
    order_number: 'OSS-10311',
    status: 'cancelled',
    created_at: '2026-08-27T14:20:00Z',
    items: [
      {
        product_id: 'demo-5',
        title: "40' High Cube — Used (Cargo Worthy)",
        image: '/images/containers/used-40ft-hc.webp',
        quantity: 1,
        price: '3650.00',
      },
    ],
    sub_total: '3650.00',
    total_shipping: '520.00',
    total_tax: '0.00',
    total_price: '4170.00',
    shipping_method: 'Tilt-bed delivery',
    shipping_city: 'Las Vegas',
    shipping_province: 'NV',
    shipping_zip_code: '89101',
  },
]

// The same rules the live order history uses (OrdersList.tsx).
export const REVIEWABLE: OrderStatus[] = ['delivered']
export const REORDERABLE: OrderStatus[] = ['delivered', 'cancelled', 'refunded']
