import { NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/agentApi'
import { fetchDepotById } from '@/services/depot.service'

type Context = { params: Promise<{ id: string }> }

/**
 * GET /api/depots/{id} — one depot (store) by its backend id, as the backend
 * returns it (types/depot.ts). 404 when there is none, 400 for an id that is
 * not a number. From the app's copy when the backend cannot be read
 * (`X-Depots-Source: snapshot`).
 */
export async function GET(request: Request, { params }: Context) {
  const raw = (await params).id
  const id = /^\d{1,9}$/.test(raw) ? Number(raw) : NaN

  return withRateLimit(
    request,
    async (headers) => {
      if (!Number.isFinite(id)) return NextResponse.json({ error: 'id must be a number.' }, { status: 400, headers })
      const { depot, source } = await fetchDepotById(id)
      const sourced = { ...headers, 'X-Depots-Source': source }
      if (!depot) return NextResponse.json({ error: 'No depot with that id.' }, { status: 404, headers: sourced })
      return NextResponse.json(depot, { headers: sourced })
    },
    'light',
  )
}
