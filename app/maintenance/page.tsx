import { Wrench, Phone } from 'lucide-react'
import { CONTACT_NUMBER } from '@/lib/helpers'

// Deliberately self-contained: no data fetching, no backend, no cache. This is
// the page shown when something is down, so it must never depend on the thing
// that is down. Static by default — nothing here opts into dynamic rendering.

export const metadata = {
  title: 'Down for Maintenance',
  // noindex while the wall is up; `follow` so link equity isn't lost. The proxy
  // also serves this with a 503 + Retry-After so crawlers come back rather than
  // treating the outage as permanent.
  robots: { index: false, follow: true },
}

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-theme-bg px-4 py-16 text-center dark:bg-neutral-950">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-theme-subtle dark:bg-neutral-800">
        <Wrench className="h-9 w-9 text-theme-muted dark:text-neutral-500" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
        We&apos;ll be back shortly
      </h1>
      <p className="mt-2 max-w-sm text-sm text-theme-muted dark:text-neutral-400">
        On-Site Storage Solutions is down for scheduled maintenance. Thanks for your patience —
        we&apos;re working to bring everything back online.
      </p>
      <a
        href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`}
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-theme-primary px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-theme-primary-dark"
      >
        <Phone className="h-4 w-4" /> Call {CONTACT_NUMBER}
      </a>
      <p className="mt-3 text-xs text-theme-muted dark:text-neutral-400">
        Monday to Friday, 6 am to 5 pm PST
      </p>
    </main>
  )
}
