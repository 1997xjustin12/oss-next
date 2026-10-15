import type { GuestOrder } from '@/types/order'

/**
 * `/order-status/demo` shows these instead of asking the backend — a fixed
 * page for showing the design to the client before real links exist.
 *
 * Not a real token: it fails the token format check, so it can never collide
 * with a link the backend issues. The page labels it as sample data.
 *
 * Three orders covering the states a guest is most likely to see: on its way,
 * awaiting payment, and delivered. Prices, tax and delivery are plausible, not
 * quoted.
 */
export const GUEST_ORDER_DEMO_TOKEN = 'demo'

export const DEMO_GUEST_ORDERS: GuestOrder[] = [
  {
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
    ],
    sub_total: '5450.00',
    total_shipping: '595.00',
    total_tax: '422.38',
    total_price: '6467.38',
    shipping_method: 'Tilt-bed delivery',
    shipping_city: 'Riverside',
    shipping_province: 'CA',
    shipping_zip_code: '92501',
    estimated_delivery: '2026-10-17',
    tracking_carrier: 'On-Site Delivery',
    tracking_number: 'OSD-48213-77',
  },
  {
    order_number: 'OSS-10432',
    status: 'unpaid',
    created_at: '2026-10-14T15:05:00Z',
    items: [
      {
        product_id: 'demo-2',
        title: "20' Standard — Used (Cargo Worthy)",
        image: '/images/containers/used-20ft-standard.webp',
        quantity: 2,
        price: '2150.00',
      },
      {
        product_id: 'demo-3',
        title: 'Container Lock Box',
        quantity: 1,
        price: '125.00',
      },
    ],
    sub_total: '4425.00',
    total_shipping: '450.00',
    total_tax: '365.06',
    total_price: '5240.06',
    shipping_method: 'Tilt-bed delivery',
    shipping_city: 'Dallas',
    shipping_province: 'TX',
    shipping_zip_code: '75201',
    payment_url: 'https://example.com/pay/demo',
  },
  {
    order_number: 'OSS-10398',
    status: 'delivered',
    created_at: '2026-09-16T20:18:00Z',
    items: [
      {
        product_id: 'demo-4',
        title: "40' Standard — Used (Wind & Watertight)",
        image: '/images/containers/used-40ft-standard.webp',
        quantity: 1,
        price: '3295.00',
      },
    ],
    sub_total: '3295.00',
    total_shipping: '395.00',
    total_tax: '283.37',
    total_price: '3973.37',
    shipping_method: 'Tilt-bed delivery',
    shipping_city: 'Phoenix',
    shipping_province: 'AZ',
    shipping_zip_code: '85004',
    delivered_at: '2026-09-24T19:30:00Z',
    tracking_carrier: 'On-Site Delivery',
    tracking_number: 'OSD-47102-31',
  },
]
