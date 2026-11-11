import { NextResponse, type NextRequest } from 'next/server'
import { DEPOT_SNAPSHOT } from '@/config/depotCoordinates'
import { withRateLimit } from '@/lib/agentApi'
import { depotFamily, filterByDepots, fromOrderRecord } from '@/lib/deliveredContainers'
import { DELIVERED_PRODUCTS_MAX_PAGE_SIZE, fetchDeliveredProducts } from '@/services/deliveredProduct.service'
import type { DeliveredContainer } from '@/types/deliveredContainer'

/**
 * GET /api/orders/delivered-products?page=1&page_size=20&depot_id=4 — the
 * store's delivered orders, from the backend's list of the same name, as
 * cards: `{ count, next, previous, results: DeliveredContainer[] }`
 * (types/deliveredContainer.ts).
 *
 * Only the card's fields leave this route (title, date, place, depot, photo):
 * the backend's records come from orders, and whatever else they carry stays
 * here (lib/deliveredContainers.ts fromOrderRecord).
 *
 * - `depot_id` keeps the deliveries of that depot and the virtual depots it
 *   serves. It filters the backend's page, so a page can hold fewer than
 *   `page_size`; `count` is still the backend's total.
 * - `page` defaults to 1 and `page_size` to 20 (at most 100); anything else,
 *   or an unknown `depot_id`, is a 400. A backend failure is a 502.
 *
 * The site's "Recently Delivered Containers" sections do not call this: they
 * render on the server from services/deliveredContainer.service.ts, which adds
 * the WordPress archive and the admin's records.
 */
const DEFAULT_PAGE_SIZE = 20

function intParam(value: string | null, fallback: number | null): number | null {
  if (value === null || value === '') return fallback
  return /^\d+$/.test(value) ? Number(value) : Number.NaN
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const page = intParam(params.get('page'), 1) as number
  const pageSize = intParam(params.get('page_size'), DEFAULT_PAGE_SIZE) as number
  const depotId = intParam(params.get('depot_id'), null)

  return withRateLimit(
    request,
    async (headers) => {
      if (!(page >= 1) || !(pageSize >= 1 && pageSize <= DELIVERED_PRODUCTS_MAX_PAGE_SIZE)) {
        return NextResponse.json(
          { error: `page must be 1 or more, and page_size 1 to ${DELIVERED_PRODUCTS_MAX_PAGE_SIZE}.` },
          { status: 400, headers },
        )
      }
      if (depotId !== null && !DEPOT_SNAPSHOT.some((d) => d.id === depotId)) {
        return NextResponse.json({ error: 'depot_id is not a depot (see /api/depots).' }, { status: 400, headers })
      }

      try {
        const list = await fetchDeliveredProducts(page, pageSize)
        let results: DeliveredContainer[] = list.results.flatMap((raw) => (raw && typeof raw === 'object' ? (fromOrderRecord(raw, DEPOT_SNAPSHOT) ?? []) : []))
        if (depotId !== null) results = filterByDepots(results, depotFamily(depotId, DEPOT_SNAPSHOT))

        const link = (n: number) => {
          const url = new URL(request.nextUrl.pathname, request.nextUrl.origin)
          url.searchParams.set('page', String(n))
          url.searchParams.set('page_size', String(pageSize))
          if (depotId !== null) url.searchParams.set('depot_id', String(depotId))
          return url.toString()
        }
        return NextResponse.json(
          { count: list.count, next: list.next ? link(page + 1) : null, previous: page > 1 ? link(page - 1) : null, results },
          { headers },
        )
      } catch (err) {
        console.error('[/api/orders/delivered-products]', err)
        return NextResponse.json({ error: 'Delivered products are unavailable right now.' }, { status: 502, headers })
      }
    },
    'light',
  )
}
