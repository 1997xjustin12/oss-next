'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, DatabaseZap, Loader2 } from 'lucide-react'
import { purgeGbpLocationCacheAction } from '@/actions/gbp'

/**
 * "Purge this page": refreshes one location's cached page now (its own cache
 * tag only; the other locations keep theirs). Admin → Cache's "GBP Location
 * Pages" clears all of them at once.
 */
export function PurgeLocationButton({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  function purge() {
    setResult(null)
    startTransition(async () => {
      const answer = await purgeGbpLocationCacheAction(slug).catch(() => ({ ok: false as const, error: 'The purge failed. Try again.' }))
      setResult(
        answer.ok
          ? { ok: true, text: `Purged at ${new Date(answer.at).toLocaleTimeString()}. The next visit renders it fresh.` }
          : { ok: false, text: answer.error },
      )
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={purge}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-md border border-theme-border px-3 py-1.5 text-sm font-semibold text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-200"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <DatabaseZap className="h-4 w-4" aria-hidden />}
        Purge this page
      </button>
      {result && (
        <span role="status" className={`flex items-center gap-1 text-xs ${result.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-theme-primary'}`}>
          {result.ok && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
          {result.text}
        </span>
      )}
    </div>
  )
}
