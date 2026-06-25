const ENRICHED_PREFIXES = ['/sale-shipping-containers']

function getPathAndParams(href: string): { path: string; params: URLSearchParams; isAbsolute: boolean } | null {
  if (href.startsWith('http') || href.startsWith('//')) {
    try {
      const url = new URL(href)
      return { path: url.pathname, params: url.searchParams, isAbsolute: true }
    } catch {
      return null
    }
  }
  const [p, search] = href.split('?')
  return { path: p, params: new URLSearchParams(search ?? ''), isAbsolute: false }
}

// Pure helper — used by React components to compute enriched hrefs during render
export function applyEnrichParams(href: string, zipcode: string, location: string): string {
  if (!zipcode && !location) return href

  const parsed = getPathAndParams(href)
  if (!parsed) return href

  const { path, params, isAbsolute } = parsed

  const matches = ENRICHED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + '/'),
  )
  if (!matches) return href
  if (params.get('location')) return href

  if (zipcode)  params.set('zipcode',  zipcode)
  if (location) params.set('location', location)

  if (isAbsolute) {
    const url = new URL(href)
    url.search = params.toString()
    return url.toString()
  }
  return `${path}?${params}`
}

// DOM mutation version — used for non-React HTML (WP proxy pages, static content)
export function enrichSaleLinks() {
  if (typeof window === 'undefined') return

  const zipcode  = localStorage.getItem('zipcode')       ?? ''
  const location = localStorage.getItem('zipcode_depot') ?? ''
  if (!zipcode && !location) return

  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
    const href = a.getAttribute('href') ?? ''
    if (!href) return
    const enriched = applyEnrichParams(href, zipcode, location)
    if (enriched !== href) a.setAttribute('href', enriched)
  })
}
