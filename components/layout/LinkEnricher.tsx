'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { enrichSaleLinks } from '@/lib/linkEnrich'

const EXCLUDED_PATHS: string[] = ['/admin']

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

    // Re-run when dropdown children or other conditional links enter the DOM
    const debouncedEnrich = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(enrichSaleLinks, 50)
    }

    observerRef.current?.disconnect()
    observerRef.current = new MutationObserver(debouncedEnrich)
    observerRef.current.observe(document.body, { childList: true, subtree: true })

    return () => {
      observerRef.current?.disconnect()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname])

  return null
}
