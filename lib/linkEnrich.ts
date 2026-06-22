const ENRICHED_PREFIXES = ['/sale-shipping-containers']

export function enrichSaleLinks() {
  if (typeof window === 'undefined') return

  const zipcode  = localStorage.getItem('zipcode')       ?? ''
  const location = localStorage.getItem('zipcode_depot') ?? ''
  if (!zipcode && !location) return

  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
    const href = a.getAttribute('href') ?? ''
    if (!href || href.startsWith('http') || href.startsWith('//')) return

    const [path, search] = href.split('?')
    const matches = ENRICHED_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(prefix + '/'),
    )
    if (!matches) return

    const params = new URLSearchParams(search ?? '')
    if (params.get('location')) return

    if (zipcode)  params.set('zipcode',  zipcode)
    if (location) params.set('location', location)
    a.setAttribute('href', `${path}?${params}`)
  })
}
