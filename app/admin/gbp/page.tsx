import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, Eye, LayoutTemplate, Layers } from 'lucide-react'
import { ADMIN_ROUTES } from '@/config/admin'
import { GBP_ROUTE_SEGMENTS } from '@/config/routes'
import { STORE_KEY } from '@/config/store'
import { GBP_PAGES } from '@/lib/data/gbpPages'
import { readGbpPageState, readGbpSeoDraft, readGbpSharedState, readGbpTemplateState } from '@/services/gbp.service'

export const metadata: Metadata = { title: 'GBP Pages', robots: { index: false, follow: false } }

const BADGE = 'rounded-full px-2 py-0.5 text-[11px] font-bold'

export default function GbpPagesAdmin() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">GBP Pages</h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-muted dark:text-neutral-400">
          The Google Business Profile location pages. Every change is a draft until you publish it; the preview shows drafts as visitors would see them.
          Editing <span className="font-semibold text-theme-dark dark:text-neutral-200">{STORE_KEY}</span>.
        </p>
      </header>
      <Suspense fallback={<p className="text-sm text-theme-muted">Loading…</p>}>
        <Overview />
      </Suspense>
    </>
  )
}

async function Overview() {
  const [shared, template, locations] = await Promise.all([
    readGbpSharedState(),
    readGbpTemplateState(),
    Promise.all(
      GBP_PAGES.map(async (seed) => {
        const [state, seoDraft] = await Promise.all([readGbpPageState(seed.slug), readGbpSeoDraft(seed.slug)])
        return { seed, state, hasDraft: !!state?.hasDraft || !!seoDraft }
      }),
    ),
  ])
  const live = new Set<string>(GBP_ROUTE_SEGMENTS)

  return (
    <div className="space-y-8">
      <section aria-labelledby="gbp-all">
        <h2 id="gbp-all" className="mb-2 text-xs font-bold tracking-wider text-theme-muted uppercase dark:text-neutral-500">
          Every GBP page
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { href: ADMIN_ROUTES.GBP_TEMPLATE, Icon: LayoutTemplate, title: 'Template', text: 'Sections, order, styles, header & footer', draft: template.hasDraft },
            { href: ADMIN_ROUTES.GBP_SHARED, Icon: Layers, title: 'Shared content', text: 'Hero, logos, cards, types, forms, footer', draft: shared.hasDraft },
          ].map(({ href, Icon, title, text, draft }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg border border-theme-border bg-theme-bg p-4 hover:border-theme-primary dark:border-neutral-800 dark:bg-neutral-900"
            >
              <Icon className="h-6 w-6 text-theme-primary" aria-hidden />
              <span className="flex-1">
                <span className="block font-bold">{title}</span>
                <span className="block text-sm text-theme-muted dark:text-neutral-400">{text}</span>
              </span>
              {draft && <span className={`${BADGE} bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300`}>Draft</span>}
              <ChevronRight className="h-4 w-4 text-theme-muted" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="gbp-locations">
        <h2 id="gbp-locations" className="mb-2 text-xs font-bold tracking-wider text-theme-muted uppercase dark:text-neutral-500">
          Locations
        </h2>
        <ul className="overflow-hidden rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900">
          {locations.map(({ seed, state, hasDraft }) => {
            const { city, stateCode } = (state?.value ?? seed).location
            return (
              <li key={seed.slug} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-theme-border p-3 last:border-b-0 dark:border-neutral-800">
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {city}, {stateCode}
                  </span>
                  <span className="block truncate text-xs text-theme-muted dark:text-neutral-500">/{seed.slug}</span>
                </span>
                {live.has(seed.slug) ? (
                  <span className={`${BADGE} bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300`}>Live</span>
                ) : (
                  <span className={`${BADGE} bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400`}>WordPress</span>
                )}
                {state?.publishedAt ? null : <span className={`${BADGE} bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300`}>From code</span>}
                {hasDraft && <span className={`${BADGE} bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300`}>Draft</span>}
                <span className="flex gap-1 text-sm">
                  <Link href={ADMIN_ROUTES.GBP_CONTENT(seed.slug)} className="rounded-md px-2 py-1 font-semibold hover:bg-theme-subtle dark:hover:bg-neutral-800">
                    Content
                  </Link>
                  <Link href={ADMIN_ROUTES.GBP_SEO(seed.slug)} className="rounded-md px-2 py-1 font-semibold hover:bg-theme-subtle dark:hover:bg-neutral-800">
                    SEO
                  </Link>
                  <a
                    href={ADMIN_ROUTES.GBP_PREVIEW(seed.slug)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-theme-subtle dark:hover:bg-neutral-800"
                  >
                    <Eye className="h-4 w-4" aria-hidden />
                    Preview
                  </a>
                </span>
              </li>
            )
          })}
        </ul>
        <p className="mt-2 text-xs text-theme-muted dark:text-neutral-500">
          “From code”: no published record in Redis yet, so the page renders its seed in lib/data/gbpPages.ts. “WordPress”: the route isn’t live yet
          (GBP_ROUTE_SEGMENTS in config/routes.ts).
        </p>
      </section>
    </div>
  )
}
