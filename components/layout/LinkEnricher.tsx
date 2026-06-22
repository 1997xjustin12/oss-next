'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ENRICHED_PREFIXES = ['/sale-shipping-containers']

export function LinkEnricher() {
  const router = useRouter()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest<HTMLAnchorElement>('a[href]')
      if (!anchor) return

      const href = anchor.getAttribute('href') ?? ''
      if (!href || href.startsWith('http') || href.startsWith('//')) return

      const [path, search] = href.split('?')
      const matches = ENRICHED_PREFIXES.some(
        (prefix) => path === prefix || path.startsWith(prefix + '/'),
      )
      if (!matches) return

      const params = new URLSearchParams(search ?? '')
      if (params.get('location')) return

      const zipcode  = localStorage.getItem('zipcode')       ?? ''
      const location = localStorage.getItem('zipcode_depot') ?? ''
      if (!zipcode && !location) return

      e.preventDefault()
      if (zipcode)  params.set('zipcode',  zipcode)
      if (location) params.set('location', location)
      router.push(`${path}?${params}`)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [router])

  return null
}
