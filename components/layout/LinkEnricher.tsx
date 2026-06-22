'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { enrichSaleLinks } from '@/lib/linkEnrich'

export function LinkEnricher() {
  const pathname = usePathname()

  useEffect(() => {
    enrichSaleLinks()
  }, [pathname])

  return null
}
