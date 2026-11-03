import { NextResponse } from 'next/server'
import { getCartUpsellAccessories } from '@/services/accessoryCatalog.service'

/**
 * GET /api/cart-upsell → { products: ProductHit[] }
 *
 * The accessories the Added to Cart dialog offers (config/cartUpsell.ts), in order.
 * Public and identical for everyone, so the CDN answers it.
 */
export async function GET() {
  const products = await getCartUpsellAccessories()
  return NextResponse.json(
    { products },
    {
      headers: products.length > 0
        ? { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' }
        : { 'Cache-Control': 'no-store' },
    },
  )
}
