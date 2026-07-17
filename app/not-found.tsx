import Link from 'next/link'
import { MapPinOff, Phone } from 'lucide-react'
import { CONTACT_NUMBER } from '@/lib/helpers'
import { ROUTES } from '@/config/routes'

export const metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-theme-bg px-4 py-16 text-center dark:bg-neutral-950">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-theme-subtle dark:bg-neutral-800">
        <MapPinOff className="h-9 w-9 text-theme-muted dark:text-neutral-500" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
        Page Not Found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-theme-muted dark:text-neutral-400">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href={ROUTES.PLP}
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-theme-primary px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-theme-primary-dark"
      >
        Browse Containers
      </Link>
      <Link
        href={ROUTES.HOME}
        className="mt-3 text-sm font-semibold text-theme-primary hover:underline dark:text-red-400"
      >
        Back to Home
      </Link>
      <a
        href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`}
        className="mt-6 flex items-center gap-1.5 text-sm text-theme-muted hover:text-theme-primary dark:text-neutral-400 dark:hover:text-red-400"
      >
        <Phone className="h-3.5 w-3.5" /> Or call us at {CONTACT_NUMBER}
      </a>
    </div>
  )
}
