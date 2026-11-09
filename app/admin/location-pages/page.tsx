import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, ExternalLink, Eye, LayoutTemplate } from 'lucide-react'
import { ADMIN_ROUTES } from '@/config/admin'
import { STORE_KEY } from '@/config/store'
import { LOCATION_PAGES } from '@/lib/data/locationPages'
import { locationPath } from '@/lib/locationPage'
import { fetchPageSitemap } from '@/services/sitemap.service'
import { readLocationPageState, readLocationTemplateState } from '@/services/locationPage.service'

export const metadata: Metadata = { title: 'Location Pages', robots: { index: false, follow: false } }

const BADGE = 'rounded-full px-2 py-0.5 text-[11px] font-bold'
const PREFIX = '/where-to-buy-shipping-containers/'

export default function LocationPagesAdmin() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Location Pages</h1>
        <p className="mt-2 max-w-2xl text-sm text-theme-muted dark:text-neutral-400">
          The /where-to-buy-shipping-containers depot pages: one template, one record per location. Every change is a draft until you publish it; the
          preview shows drafts as visitors would see them. Titles, descriptions and scripts are in the Page Configurator. Editing{' '}
          <span className="font-semibold text-theme-dark dark:text-neutral-200">{STORE_KEY}</span>.
        </p>
      </header>
      <Suspense fallback={<p className="text-sm text-theme-muted">Loading…</p>}>
        <Overview />
      </Suspense>
    </>
  )
}

async function Overview() {
  const [template, locations, sitemap] = await Promise.all([
    readLocationTemplateState(),
    Promise.all(LOCATION_PAGES.map(async (seed) => ({ seed, state: await readLocationPageState(seed.slug) }))),
    fetchPageSitemap(),
  ])
  const native = new Set(LOCATION_PAGES.map((page) => page.slug))
  // Location pages WordPress still serves through the route's fallback: the old copies, Birmingham, Orlando.
  const wordpress = sitemap
    .map((row) => row.path.replace(/\/+$/, ''))
    .filter((path) => path.startsWith(PREFIX) && !native.has(path.slice(PREFIX.length)))

  return (
    <div className="space-y-8">
      <section aria-labelledby="loc-all">
        <h2 id="loc-all" className="mb-2 text-xs font-bold tracking-wider text-theme-muted uppercase dark:text-neutral-500">
          Every location page
        </h2>
        <Link
          href={ADMIN_ROUTES.LOCATION_TEMPLATE}
          className="flex items-center gap-3 rounded-lg border border-theme-border bg-theme-bg p-4 hover:border-theme-primary sm:max-w-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          <LayoutTemplate className="h-6 w-6 text-theme-primary" aria-hidden />
          <span className="flex-1">
            <span className="block font-bold">Template</span>
            <span className="block text-sm text-theme-muted dark:text-neutral-400">Sections, all shared wording, images, products, delivery photos, FAQ</span>
          </span>
          {template.hasDraft && <span className={`${BADGE} bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300`}>Draft</span>}
          <ChevronRight className="h-4 w-4 text-theme-muted" aria-hidden />
        </Link>
      </section>

      <section aria-labelledby="loc-list">
        <h2 id="loc-list" className="mb-2 text-xs font-bold tracking-wider text-theme-muted uppercase dark:text-neutral-500">
          Locations ({locations.length} native)
        </h2>
        <ul className="overflow-hidden rounded-lg border border-theme-border bg-theme-bg dark:border-neutral-800 dark:bg-neutral-900">
          {locations.map(({ seed, state }) => (
            <li key={seed.slug} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-theme-border p-3 last:border-b-0 dark:border-neutral-800">
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{(state?.value ?? seed).place.label}</span>
                <span className="block truncate text-xs text-theme-muted dark:text-neutral-500">{locationPath(seed.slug)}</span>
              </span>
              {state?.publishedAt ? null : <span className={`${BADGE} bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300`}>From code</span>}
              {state?.hasDraft && <span className={`${BADGE} bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300`}>Draft</span>}
              <span className="flex gap-1 text-sm">
                <Link href={ADMIN_ROUTES.LOCATION_PAGE(seed.slug)} className="rounded-md px-2 py-1 font-semibold hover:bg-theme-subtle dark:hover:bg-neutral-800">
                  Edit
                </Link>
                <Link href={ADMIN_ROUTES.PAGE_CONFIGURATOR_EDIT(`location-${seed.slug}`)} className="rounded-md px-2 py-1 font-semibold hover:bg-theme-subtle dark:hover:bg-neutral-800">
                  SEO
                </Link>
                <a href={ADMIN_ROUTES.LOCATION_PREVIEW(seed.slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-theme-subtle dark:hover:bg-neutral-800">
                  <Eye className="h-4 w-4" aria-hidden />
                  Preview
                </a>
                <a href={locationPath(seed.slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-theme-subtle dark:hover:bg-neutral-800">
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Live
                </a>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-theme-muted dark:text-neutral-500">
          “From code”: no published record in Redis yet, so the page renders its record in lib/data/locationPageRecords.ts (Atlanta: locationPages.ts).
          Publishing once stores it here.
        </p>
      </section>

      {wordpress.length > 0 && (
        <section aria-labelledby="loc-wp">
          <h2 id="loc-wp" className="mb-2 text-xs font-bold tracking-wider text-theme-muted uppercase dark:text-neutral-500">
            Still served from WordPress ({wordpress.length})
          </h2>
          <ul className="flex flex-wrap gap-2 text-sm">
            {wordpress.map((path) => (
              <li key={path}>
                <a href={path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-theme-border px-2 py-1 hover:bg-theme-subtle dark:border-neutral-800 dark:hover:bg-neutral-800">
                  {path.slice(PREFIX.length)}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-theme-muted dark:text-neutral-500">
            Old copies and pages with no depot (docs/reference/location-pages.md). They render their WordPress page until they get a record or a redirect.
          </p>
        </section>
      )}
    </div>
  )
}
