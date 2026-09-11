import { NextRequest, NextResponse } from 'next/server'
import { getProductsBySkus } from '@/services/search.service'

/**
 * GET /api/products/by-skus?skus=A,B — the catalogue products behind a
 * signed-in customer's saved cart, which only records each line's SKU.
 * See getProductsBySkus.
 */

// A cart is a handful of lines; this bounds a crafted request.
const MAX_SKUS = 50

export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get('skus')
  if (!param) return NextResponse.json({ error: 'skus is required.' }, { status: 400 })

  const skus = param.split(',').map((sku) => sku.trim()).filter(Boolean).slice(0, MAX_SKUS)

  try {
    return NextResponse.json({ products: await getProductsBySkus(skus) })
  } catch (err) {
    console.error('[/api/products/by-skus]', err)
    return NextResponse.json({ error: 'Could not load products.' }, { status: 500 })
  }
}
