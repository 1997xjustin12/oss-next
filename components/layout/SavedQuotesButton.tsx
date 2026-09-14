'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { countSavedQuotes, SAVED_QUOTES_EVENT } from '@/lib/savedQuotes'

/**
 * Header link to the quotes this browser has saved, with a count.
 *
 * Saved quotes live in localStorage, so the count is read as an external store:
 * zero on the server and during hydration, the real figure straight after, and
 * updated when a quote is saved in this tab (SAVED_QUOTES_EVENT) or another one
 * (`storage`).
 */

function subscribe(onChange: () => void) {
  window.addEventListener(SAVED_QUOTES_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(SAVED_QUOTES_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function SavedQuotesButton() {
  const count = useSyncExternalStore(subscribe, countSavedQuotes, () => 0)

  return (
    <Link
      href={ROUTES.SAVED_QUOTES}
      aria-label={`View saved quotes — ${count} saved quote${count !== 1 ? 's' : ''}`}
      className="relative flex items-center justify-center px-1.5 text-theme-muted transition-colors hover:text-theme-primary"
    >
      <FileText className="w-5.5 h-5.5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-0.5 bg-theme-primary text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
