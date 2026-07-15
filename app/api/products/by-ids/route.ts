import { NextRequest, NextResponse } from 'next/server'
import { getProductsByIds } from '@/services/search.service'

// GET /api/products/by-ids?ids=1,2,3 — used to enrich order line items
// (which only carry product_id/quantity/price) with title/image for display.
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get('ids')

  if (!idsParam) {
    return NextResponse.json({ error: 'ids is required.' }, { status: 400 })
  }

  const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean)

  try {
    const products = await getProductsByIds(ids)
    return NextResponse.json({ products })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load products.'
    console.error('[/api/products/by-ids]', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
