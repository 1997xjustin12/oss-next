import { NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/agentApi'
import { fetchDepots } from '@/services/depot.service'

/**
 * GET /api/depots — every depot (store), main and virtual, as the backend
 * returns them: `{ count, results: Depot[] }` (types/depot.ts). The backend's
 * pages are folded into one list. When the backend cannot be read, the answer
 * comes from the app's copy (config/depotCoordinates.ts), and the
 * `X-Depots-Source: snapshot` header says so.
 */
export async function GET(request: Request) {
  return withRateLimit(
    request,
    async (headers) => {
      const { count, results, source } = await fetchDepots()
      return NextResponse.json({ count, results }, { headers: { ...headers, 'X-Depots-Source': source } })
    },
    'light',
  )
}
