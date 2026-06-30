import { NextResponse } from 'next/server'
import { Client } from '@elastic/elasticsearch'

function cleanEnv(val: string | undefined): string {
  return (val ?? '').split('#')[0].trim().replace(/\/$/, '')
}

export async function GET() {
  const node    = cleanEnv(process.env.ELASTIC_URL)    || 'http://localhost:9200'
  const apiKey  = cleanEnv(process.env.ELASTIC_API_KEY)
  const index   = cleanEnv(process.env.NEXT_PUBLIC_SEARCH_INDEX) || 'onsite_products_index'
  const geoKey  = process.env.GEOAPIFY_API_KEY ?? process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? ''

  const envStatus = {
    ELASTIC_URL:           !!process.env.ELASTIC_URL,
    ELASTIC_API_KEY:       !!process.env.ELASTIC_API_KEY,
    NEXT_PUBLIC_SEARCH_INDEX: !!process.env.NEXT_PUBLIC_SEARCH_INDEX,
    GEOAPIFY_API_KEY:      !!geoKey,
    node_resolved:         node,
    index_resolved:        index,
  }

  try {
    const client = new Client({ node, auth: { apiKey } })
    const info   = await client.count({ index })
    return NextResponse.json({ ok: true, count: info.count, env: envStatus })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: msg, env: envStatus }, { status: 500 })
  }
}
