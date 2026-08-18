import { Suspense } from 'react'
import { connection } from 'next/server'
import { CRAWLERS_BY_UA } from '@/config/crawlers'
import { readAgentStats, readMcpToolStats, type AgentDayStats } from '@/lib/agentLog'
import type { CrawlerPurpose } from '@/config/crawlers'

/**
 * Which AI crawlers and agents actually visit, what they read, and what they
 * get back.
 *
 * The feedback loop for the whole agentic-readiness programme: llms.txt, the
 * Markdown views, the structured data and the agent API are all bets until this
 * page shows whether anything is taking us up on them. It also answers the
 * question the crawler policy in config/crawlers.ts can only guess at — whether
 * a blocked training crawler is still knocking, and whether the search crawlers
 * we allowed ever showed up.
 *
 * Dev/preview only, like the rest of /admin. The three production gates
 * (proxy.ts, the admin layout, and each Server Action) cover this page too —
 * it reads only, so there is no action to gate here.
 */

const DAYS = 14

export const metadata = { title: 'Agent Traffic' }

const PURPOSE_LABEL: Record<CrawlerPurpose, string> = {
  'ai-search': 'AI search',
  'user-initiated': 'User-initiated',
  training: 'Training',
  search: 'Web search',
}

const PURPOSE_STYLE: Record<CrawlerPurpose, string> = {
  'ai-search': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'user-initiated': 'bg-sky-50 text-sky-700 ring-sky-600/20',
  training: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  search: 'bg-neutral-100 text-neutral-700 ring-neutral-500/20',
}

type Row = {
  agent: string
  total: number
  purpose: CrawlerPurpose
  allowed: boolean
  topPaths: [string, number][]
  statuses: [string, number][]
}

function summarise(days: AgentDayStats[]): Row[] {
  const totals = new Map<string, number>()
  const paths = new Map<string, Map<string, number>>()
  const statuses = new Map<string, Map<string, number>>()

  for (const day of days) {
    for (const [agent, n] of Object.entries(day.totals)) {
      totals.set(agent, (totals.get(agent) ?? 0) + n)
    }
    for (const [agent, byPath] of Object.entries(day.paths)) {
      const acc = paths.get(agent) ?? new Map<string, number>()
      for (const [path, n] of Object.entries(byPath)) acc.set(path, (acc.get(path) ?? 0) + n)
      paths.set(agent, acc)
    }
    for (const [agent, byStatus] of Object.entries(day.statuses)) {
      const acc = statuses.get(agent) ?? new Map<string, number>()
      for (const [status, n] of Object.entries(byStatus)) acc.set(status, (acc.get(status) ?? 0) + n)
      statuses.set(agent, acc)
    }
  }

  const top = (m: Map<string, number> | undefined, n: number): [string, number][] =>
    [...(m?.entries() ?? [])].sort((a, b) => b[1] - a[1]).slice(0, n)

  return [...totals.entries()]
    .map(([agent, total]): Row => {
      const crawler = CRAWLERS_BY_UA.get(agent.toLowerCase())
      return {
        agent,
        total,
        purpose: crawler?.purpose ?? 'search',
        allowed: crawler?.allow ?? true,
        topPaths: top(paths.get(agent), 5),
        statuses: top(statuses.get(agent), 5),
      }
    })
    .sort((a, b) => b.total - a.total)
}

async function AgentTrafficReport() {
  // Live counters keyed by today's date — inherently request-time data, so
  // there is nothing to prerender. Without this, reading the clock during the
  // build fails with next-prerender-current-time.
  await connection()

  const [days, mcp] = await Promise.all([readAgentStats(DAYS), readMcpToolStats(DAYS)])
  const rows = summarise(days)
  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0)
  const mcpRows = Object.entries(mcp.calls)
    .map(([tool, calls]) => ({ tool, calls, errors: mcp.errors[tool] ?? 0 }))
    .sort((a, b) => b.calls - a.calls)

  const mcpSection =
    mcpRows.length > 0 ? (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-900">MCP tool calls</h2>
        <p className="text-xs text-neutral-600">
          Which tools assistants actually invoke over <code>/api/mcp</code>. A tool that is
          never called is either badly described or unnecessary; a high error rate means the
          model can&apos;t get the arguments right from its schema.
        </p>
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">Tool</th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-right">Calls</th>
                <th scope="col" className="px-4 py-2.5 font-semibold text-right">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {mcpRows.map((row) => (
                <tr key={row.tool}>
                  <th scope="row" className="px-4 py-2.5 font-mono text-[13px] font-semibold text-neutral-900">
                    {row.tool}
                  </th>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.calls.toLocaleString()}</td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${row.errors ? 'font-semibold text-red-700' : 'text-neutral-400'}`}>
                    {row.errors.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    ) : null

  if (grandTotal === 0 && mcpRows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600">
        <p className="font-medium text-neutral-800">No agent traffic recorded yet.</p>
        <p className="mt-1">
          Counters are written by <code>proxy.ts</code> only for the user agents listed in{' '}
          <code>config/crawlers.ts</code>, and only once real crawlers reach a deployed
          environment. An empty table here on localhost is expected — it does not mean
          logging is broken.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-600">
        {grandTotal.toLocaleString()} agent requests over the last {DAYS} days.
      </p>

      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-semibold">Agent</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Purpose</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Policy</th>
              <th scope="col" className="px-4 py-2.5 font-semibold text-right">Requests</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Statuses</th>
              <th scope="col" className="px-4 py-2.5 font-semibold">Top paths</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((row) => (
              <tr key={row.agent} className="align-top">
                <th scope="row" className="px-4 py-3 font-mono text-[13px] font-semibold text-neutral-900">
                  {row.agent}
                </th>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${PURPOSE_STYLE[row.purpose]}`}>
                    {PURPOSE_LABEL[row.purpose]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  {row.allowed ? (
                    <span className="text-emerald-700">allowed</span>
                  ) : (
                    // A blocked crawler with a non-zero count is the interesting
                    // case: it means robots.txt is being ignored.
                    <span className="font-semibold text-red-700">
                      disallowed — still crawling
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                  {row.total.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-600">
                  {row.statuses.map(([status, n]) => (
                    <div key={status} className={status.startsWith('4') || status.startsWith('5') ? 'text-red-700' : ''}>
                      {status}: {n.toLocaleString()}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-600">
                  {row.topPaths.map(([path, n]) => (
                    <div key={path} className="truncate max-w-xs" title={path}>
                      {path} <span className="text-neutral-400">({n})</span>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mcpSection}
    </div>
  )
}

export default function AgentTrafficPage() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-neutral-900">Agent Traffic</h1>
        <p className="mt-1 text-sm text-neutral-600">
          AI crawler and assistant requests, from the counters <code>proxy.ts</code> writes.
          Policy for each agent lives in <code>config/crawlers.ts</code>.
        </p>
      </header>

      {/* Redis read is request-time work; the Suspense boundary keeps it from
          blocking the admin shell from rendering. */}
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading counters…</p>}>
        <AgentTrafficReport />
      </Suspense>
    </div>
  )
}
