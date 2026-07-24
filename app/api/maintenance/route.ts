import { NextRequest, NextResponse } from 'next/server'
import {
  setMaintenanceMode,
  readMaintenanceFlag,
  MAINTENANCE_ENV_FORCED_ON,
} from '@/lib/maintenance'

/**
 * Runtime maintenance-wall toggle. No redeploy — flips the Redis flag the proxy
 * reads.
 *
 * Auth: same shared secret as /api/revalidate.
 *   Header: x-revalidate-token: <REVALIDATE_SECRET>
 *
 * GET  — report current state.
 * POST — set it. Body: { "on": true } | { "on": false }.
 *
 * Examples:
 *   curl -X POST /api/maintenance -H "x-revalidate-token: $TOKEN" -d '{"on":true}'
 *   curl -X POST /api/maintenance -H "x-revalidate-token: $TOKEN" -d '{"on":false}'
 */

function authorized(request: NextRequest): boolean {
  const token = request.headers.get('x-revalidate-token')
  return !!process.env.REVALIDATE_SECRET && token === process.env.REVALIDATE_SECRET
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const flag = await readMaintenanceFlag()
  return NextResponse.json({
    // The wall is effectively up if EITHER the env kill-switch or the flag is on.
    maintenance: MAINTENANCE_ENV_FORCED_ON || flag,
    source: {
      envForcedOn: MAINTENANCE_ENV_FORCED_ON,
      redisFlag: flag,
    },
  })
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (typeof body?.on !== 'boolean') {
    return NextResponse.json({ error: 'Body must be { "on": boolean }.' }, { status: 400 })
  }

  try {
    await setMaintenanceMode(body.on)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not update the maintenance flag.'
    console.error('[/api/maintenance]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({
    maintenance: MAINTENANCE_ENV_FORCED_ON || body.on,
    redisFlag: body.on,
    // Make the kill-switch's precedence visible rather than silently ignored.
    ...(MAINTENANCE_ENV_FORCED_ON && !body.on
      ? { note: 'MAINTENANCE_MODE env kill-switch is ON, so the wall stays up regardless.' }
      : {}),
  })
}
