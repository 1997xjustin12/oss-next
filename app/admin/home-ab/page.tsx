import { Suspense } from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import { ADMIN_ROUTES } from '@/config/admin'
import { HOME_PREVIEW_PARAM, HOME_VARIANTS } from '@/config/homeAb'
import { ROUTES } from '@/config/routes'
import { compareRates, SCROLL_MARKS, type Device, type HomeAbTotals, type HomeVariant } from '@/lib/homeAb'
import { homeAbRecording, lastDays, readHomeAbHeat, readHomeAbTotals } from '@/lib/homeAbStore'
import { HomeHeatmap } from './_components/HomeHeatmap'

/**
 * The homepage A/B/C test, measured by the site itself (lib/homeAb.ts): how
 * many saw each version, how far they scrolled, what they clicked and whether
 * they sent the form, with a click heatmap of each version.
 *
 * Gated like the rest of /admin (proxy.ts, the admin layout). Reads only.
 */

export const metadata = { title: 'Homepage A/B' }

const RANGES = [7, 30, 90] as const
const VERSION_NAME: Record<HomeVariant, string> = { 1: 'Version 1 (control)', 2: 'Version 2', 3: 'Version 3' }
const REGION_NAME: Record<string, string> = { h: 'Header', m: 'Page', f: 'Footer' }

type Search = { days?: string; v?: string; d?: string }
type Props = { searchParams: Promise<Search> }

const pct = (part: number, whole: number) => (whole ? `${((part / whole) * 100).toFixed(1)} %` : '—')
const num = (n: number) => n.toLocaleString('en-US')

function pickRange(raw: string | undefined): (typeof RANGES)[number] {
  return RANGES.find((r) => String(r) === raw) ?? 30
}

function href(search: Search, change: Partial<Search>) {
  const params = new URLSearchParams({ ...search, ...change } as Record<string, string>)
  return `${ADMIN_ROUTES.HOME_AB}?${params}`
}

const VERDICT_STYLE: Record<ReturnType<typeof compareRates>, string> = {
  better: 'text-emerald-700',
  worse: 'text-red-700',
  'no clear difference': 'text-neutral-500',
  'too early': 'text-neutral-400',
}

function Verdict({ control, variant, hits }: { control: HomeAbTotals; variant: HomeAbTotals; hits: (t: HomeAbTotals) => number }) {
  const verdict = compareRates({ hits: hits(control), total: control.views }, { hits: hits(variant), total: variant.views })
  return <div className={`text-xs ${VERDICT_STYLE[verdict]}`}>{verdict === 'too early' ? 'too early to tell' : `${verdict} than V1`}</div>
}

type Metric = { label: string; hint?: string; value: (t: HomeAbTotals) => string; rate?: (t: HomeAbTotals) => number }

const totalSubmits = (t: HomeAbTotals) => Object.values(t.submits).reduce((a, b) => a + b, 0)

const METRICS: Metric[] = [
  { label: 'Views', hint: 'desktop / mobile', value: (t) => `${num(t.views)} (${num(t.viewsDesktop)} / ${num(t.viewsMobile)})` },
  { label: 'Unique visitors', value: (t) => num(t.visitors) },
  { label: 'Engaged', hint: 'clicked, or scrolled past 25 %', value: (t) => pct(t.engaged, t.views), rate: (t) => t.engaged },
  ...SCROLL_MARKS.slice(1).map((mark): Metric => ({ label: `Reached ${mark} % of page`, value: (t) => pct(t.scroll[mark], t.views) })),
  { label: 'Clicks per view', value: (t) => (t.views ? (t.clicks / t.views).toFixed(2) : '—') },
  { label: 'Form submits', hint: 'the conversion', value: (t) => `${num(totalSubmits(t))} (${pct(totalSubmits(t), t.views)})`, rate: totalSubmits },
]

function Comparison({ totals }: { totals: Record<HomeVariant, HomeAbTotals> }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-semibold">Measure</th>
            {HOME_VARIANTS.map((v) => (
              <th key={v} scope="col" className="px-4 py-2.5 text-right font-semibold">{VERSION_NAME[v]}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {METRICS.map((metric) => (
            <tr key={metric.label}>
              <th scope="row" className="px-4 py-2.5 font-medium text-neutral-900">
                {metric.label}
                {metric.hint && <div className="text-xs font-normal text-neutral-500">{metric.hint}</div>}
              </th>
              {HOME_VARIANTS.map((v) => (
                <td key={v} className="px-4 py-2.5 text-right tabular-nums">
                  {metric.value(totals[v])}
                  {metric.rate && v !== 1 && <Verdict control={totals[1]} variant={totals[v]} hits={metric.rate} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TopClicks({ totals }: { totals: Record<HomeVariant, HomeAbTotals> }) {
  const all = new Map<string, number>()
  for (const v of HOME_VARIANTS) for (const [target, n] of Object.entries(totals[v].targets)) all.set(target, (all.get(target) ?? 0) + n)
  const rows = [...all].sort((a, b) => b[1] - a[1]).slice(0, 20)
  if (!rows.length) return <p className="text-sm text-neutral-500">No clicks on links or buttons yet.</p>

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-semibold">Clicked</th>
            {HOME_VARIANTS.map((v) => (
              <th key={v} scope="col" className="px-4 py-2.5 text-right font-semibold">V{v} <span className="normal-case font-normal">(per 100 views)</span></th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map(([target]) => {
            const [region, ...rest] = target.split(':')
            return (
              <tr key={target}>
                <th scope="row" className="px-4 py-2 font-normal">
                  <span className="mr-2 rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600">{REGION_NAME[region] ?? region}</span>
                  <span className="font-mono text-[13px] text-neutral-900">{rest.join(':')}</span>
                </th>
                {HOME_VARIANTS.map((v) => {
                  const n = totals[v].targets[target] ?? 0
                  return (
                    <td key={v} className="px-4 py-2 text-right tabular-nums">
                      {num(n)} <span className="text-neutral-400">({totals[v].views ? ((n / totals[v].views) * 100).toFixed(1) : '—'})</span>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Tabs<T extends string | number>({ items, current, label, link }: { items: readonly T[]; current: T; label: (item: T) => string; link: (item: T) => string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Link
          key={item}
          href={link(item)}
          scroll={false}
          aria-current={item === current ? 'page' : undefined}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${item === current ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
        >
          {label(item)}
        </Link>
      ))}
    </div>
  )
}

async function Report({ searchParams }: Props) {
  await connection()
  const search = await searchParams
  const range = pickRange(search.days)
  const variant = (HOME_VARIANTS.find((v) => String(v) === search.v) ?? 1) as HomeVariant
  const device: Device = search.d === 'm' ? 'm' : 'd'
  const days = lastDays(range)

  const [{ totals, complete }, heat] = await Promise.all([readHomeAbTotals(days), readHomeAbHeat(days, variant, device)])
  const cells = Object.entries(heat.cells).map(([key, n]) => [...key.split(':').map(Number), n] as [number, number, number, number])
  const mapped = cells.reduce((sum, c) => sum + c[3], 0)
  const anyViews = HOME_VARIANTS.some((v) => totals[v].views > 0)
  const state = { days: String(range), v: String(variant), d: device }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs items={RANGES} current={range} label={(r) => `Last ${r} days`} link={(r) => href(state, { days: String(r) })} />
        {(!complete || !heat.complete) && <p className="text-xs text-amber-700">Some days could not be read; the numbers are partial.</p>}
      </div>

      {!anyViews && (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm text-neutral-600">
          <p className="font-medium text-neutral-800">No homepage views recorded in this range yet.</p>
          <p className="mt-1">
            {homeAbRecording()
              ? 'Views are recorded on the live site as visitors leave the homepage; they show here within a few minutes.'
              : 'This deployment does not record (only the live site does, so test visits stay out). The numbers shown are the live site’s.'}
          </p>
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-900">Versions compared</h2>
        <p className="text-xs text-neutral-600">
          “Better / worse than V1” only appears once the difference is unlikely to be chance (95 %), with at least 100 views each.
        </p>
        <Comparison totals={totals} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-900">Most clicked</h2>
        <p className="text-xs text-neutral-600">Links by address, buttons by their text.</p>
        <TopClicks totals={totals} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900">Click heatmap</h2>
        <div className="flex flex-wrap gap-4">
          <Tabs items={HOME_VARIANTS} current={variant} label={(v) => `Version ${v}`} link={(v) => href(state, { v: String(v) })} />
          <Tabs items={['d', 'm'] as const} current={device} label={(d) => (d === 'd' ? 'Desktop' : 'Mobile')} link={(d) => href(state, { d })} />
        </div>
        <p className="text-xs text-neutral-600">
          {num(mapped)} click{mapped === 1 ? '' : 's'} on version {variant}, {device === 'd' ? 'desktop' : 'mobile'}, last {range} days, drawn over the page as it is now.
          Red is where most people clicked. Clicks in the site header and footer are counted above but not mapped.
        </p>
        <HomeHeatmap key={`${variant}-${device}`} variant={variant} device={device} cells={cells} />
      </section>
    </div>
  )
}

export default function HomeAbPage({ searchParams }: Props) {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-neutral-900">Homepage A/B</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Each visitor sees one of three homepage versions, kept for 30 days. Preview one without joining the test (and without being counted):{' '}
          {HOME_VARIANTS.map((v, i) => (
            <span key={v}>
              {i > 0 && ' · '}
              <Link href={`${ROUTES.HOME}?${HOME_PREVIEW_PARAM}=${v}`} prefetch={false} target="_blank" rel="noopener" className="font-medium text-blue-700 underline">
                /?{HOME_PREVIEW_PARAM}={v}
              </Link>
            </span>
          ))}
        </p>
      </header>
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading the numbers…</p>}>
        <Report searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
