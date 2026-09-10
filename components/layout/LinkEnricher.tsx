'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { enrichSaleLinks, EXTERNAL_HTML_ATTR } from '@/lib/linkEnrich'
import { ADMIN_PATHS } from '@/lib/admin'
import { VISITOR_ZIP_EVENT } from '@/lib/visitorZip'

// Storefront link rewriting has no business running over the admin UI.
const EXCLUDED_PATHS: string[] = [...ADMIN_PATHS]

export function LinkEnricher() {
  const pathname = usePathname()
  const observerRef = useRef<MutationObserver | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const excluded = EXCLUDED_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + '/'),
    )
    if (excluded) {
      observerRef.current?.disconnect()
      return
    }

    enrichSaleLinks()

    // Re-run when more of an injected page streams in.
    const debouncedEnrich = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(enrichSaleLinks, 50)
    }

    observerRef.current?.disconnect()

    // Watch only the injected-HTML containers, not the whole body. Observing
    // `document.body` with `subtree: true` meant every React render anywhere on
    // the page scheduled another full sweep — on a route with no injected HTML
    // at all, which is most of them, all of that work found nothing to do.
    const containers = document.querySelectorAll<HTMLElement>(`[${EXTERNAL_HTML_ATTR}]`)
    if (containers.length === 0) return

    const observer = new MutationObserver(debouncedEnrich)
    containers.forEach((container) =>
      observer.observe(container, { childList: true, subtree: true }),
    )
    observerRef.current = observer

    // Re-sweep when the visitor's location changes, not only when more content
    // arrives. `useGeoapify` calls `enrichSaleLinks()` by hand after a
    // selection, which works but means every future ZIP input has to remember
    // to do the same. Listening here makes one broadcast enough:
    // `notifyVisitorZipChange()` already updates React-rendered links through
    // `useStoredZip`, and now updates the injected HTML too.
    window.addEventListener(VISITOR_ZIP_EVENT, enrichSaleLinks)
    window.addEventListener('storage', enrichSaleLinks)

    return () => {
      observerRef.current?.disconnect()
      if (timerRef.current) clearTimeout(timerRef.current)
      window.removeEventListener(VISITOR_ZIP_EVENT, enrichSaleLinks)
      window.removeEventListener('storage', enrichSaleLinks)
    }
  }, [pathname])

  return null
}
