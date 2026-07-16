'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Phone, RotateCcw } from 'lucide-react'
import { CONTACT_NUMBER } from '@/lib/helpers'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[app/error.tsx]', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-theme-bg px-4 py-16 text-center dark:bg-neutral-950">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-theme-primary-light dark:bg-red-950/40">
        <AlertTriangle className="h-9 w-9 text-theme-primary dark:text-red-400" />
      </div>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-theme-dark dark:text-neutral-100">
        Something Went Wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-theme-muted dark:text-neutral-400">
        We hit an unexpected error loading this page. Try again, or head back home.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-theme-primary px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-theme-primary-dark"
      >
        <RotateCcw className="h-4 w-4" /> Try Again
      </button>
      <Link
        href="/"
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
