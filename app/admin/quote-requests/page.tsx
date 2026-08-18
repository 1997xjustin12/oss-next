import { Suspense } from 'react'
import { connection } from 'next/server'
import { readQuoteRequests } from '@/services/quote.service'
import { SITE } from '@/config/site'

/**
 * Quote requests submitted through the agent API.
 *
 * This exists because the endpoint has nowhere else to send them. The app has
 * no CRM integration — the homepage form posts nowhere — so `deliverQuoteRequest`
 * writes to Redis and this page is how a human sees the result.
 *
 * **That makes this a stopgap, not a process.** Leads visible only to whoever
 * remembers to open a dev-only admin page will be missed. Wiring
 * `deliverQuoteRequest()` to the real sales pipeline is the outstanding work,
 * and it is recorded as such in docs/audits/AGENTIC_READINESS.md.
 */

export const metadata = { title: 'Quote Requests' }

const TH = 'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500'
const TD = 'px-4 py-3 align-top text-sm'

async function QuoteRequestList() {
  await connection()
  const quotes = await readQuoteRequests(100)

  if (quotes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600">
        <p className="font-medium text-neutral-800">No agent-submitted quote requests yet.</p>
        <p className="mt-1">
          These arrive via <code>POST /api/agent/v1/quote</code>. An empty list on localhost is
          expected.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full border-collapse text-left">
        <thead className="bg-neutral-50">
          <tr>
            <th scope="col" className={TH}>Received</th>
            <th scope="col" className={TH}>Customer</th>
            <th scope="col" className={TH}>Destination</th>
            <th scope="col" className={TH}>Product</th>
            <th scope="col" className={TH}>Notes</th>
            <th scope="col" className={TH}>Submitted by</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {quotes.map((q) => (
            <tr key={q.id}>
              <td className={`${TD} whitespace-nowrap text-neutral-500`}>
                {q.receivedAt.replace('T', ' ').slice(0, 16)}
              </td>
              <td className={TD}>
                <div className="font-semibold text-neutral-900">{q.name}</div>
                <a href={`mailto:${q.email}`} className="text-neutral-600 hover:underline">{q.email}</a>
                {q.phone ? <div className="text-neutral-600">{q.phone}</div> : null}
              </td>
              <td className={`${TD} whitespace-nowrap`}>
                {q.zip}
                {q.quantity ? <div className="text-xs text-neutral-500">Qty {q.quantity}</div> : null}
              </td>
              <td className={`${TD} font-mono text-[12px] text-neutral-700`}>
                {q.handle ?? <span className="font-sans text-neutral-400">not specified</span>}
              </td>
              <td className={`${TD} max-w-xs text-neutral-700`}>{q.notes ?? '—'}</td>
              <td className={TD}>
                {/* Self-reported and unverifiable — labelled so nobody treats it
                    as authentication. */}
                <span className="text-neutral-700">{q.agentName ?? 'unnamed agent'}</span>
                <div className="text-[11px] text-neutral-400">self-reported</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function QuoteRequestsPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-neutral-900">Quote Requests</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Leads submitted by AI agents on a customer&apos;s behalf, via{' '}
          <code>POST /api/agent/v1/quote</code>. Agents may request a quote; they cannot order
          or pay — a person closes the sale.
        </p>
      </header>

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">These leads are not reaching sales automatically.</p>
        <p className="mt-1">
          {SITE.name} has no CRM integration in this app, so submissions are stored in Redis and
          shown here only. Until <code>deliverQuoteRequest()</code> is wired to the real sales
          pipeline, someone has to check this page — which is not a process to rely on.
        </p>
      </div>

      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <QuoteRequestList />
      </Suspense>
    </div>
  )
}
