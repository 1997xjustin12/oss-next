import { ROUTES } from '@/config/routes'
import { CONTACT_NUMBER } from '@/lib/helpers'
import type { PageSeoDefaults } from '@/types/seo'
import type { LocationPage, LocationTemplate, LocationTemplateText } from '@/types/locationPage'

/**
 * Pure helpers for the /where-to-buy-shipping-containers/[location] pages: the
 * page's path, its wording (template + overrides, placeholders filled), its
 * listing links and its SEO defaults. No reads here, so config files can use it.
 */

export function locationPath(slug: string): string {
  return `${ROUTES.WHERE_TO_BUY}/${slug}`
}

/** What `{…}` placeholders become on one page. */
export function locationVars(page: LocationPage): Record<string, string> {
  const { city, region, regionName } = page.place
  return {
    city,
    region,
    regionName,
    cityRegion: `${city}, ${region}`,
    phone: CONTACT_NUMBER,
  }
}

/** Fills `{name}` placeholders; an unknown one is left as written, so a typo shows rather than vanishing. */
export function fillPlaceholders(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) => vars[name] ?? match)
}

function fillDeep<T>(value: T, vars: Record<string, string>): T {
  if (typeof value === 'string') return fillPlaceholders(value, vars) as T
  if (Array.isArray(value)) return value.map((item) => fillDeep(item, vars)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fillDeep(item, vars)])) as T
  }
  return value
}

/**
 * The page's wording: the template's, with the location's overrides laid over
 * it field by field (an empty override keeps the template's), then the
 * placeholders filled. `{phone}` is left in place: the renderer turns it into
 * a call link (LocationRichText), so it is filled there.
 */
export function resolveLocationText(
  template: LocationTemplate,
  page: LocationPage,
  /** Values read at render time, e.g. `{ lowestRent: '$95.00' }`. */
  live: Record<string, string> = {},
): LocationTemplateText {
  const merged = Object.fromEntries(
    (Object.keys(template.text) as (keyof LocationTemplateText)[]).map((key) => {
      const base = template.text[key]
      const override = page.text?.[key]
      if (typeof base === 'string') return [key, typeof override === 'string' && override.trim() ? override : base]
      const fields = override && typeof override === 'object' ? override : {}
      return [
        key,
        Object.fromEntries(
          Object.entries(base).map(([field, value]) => {
            const replacement = (fields as Record<string, unknown>)[field]
            return [field, typeof replacement === 'string' && replacement.trim() ? replacement : value]
          }),
        ),
      ]
    }),
  ) as LocationTemplateText

  return fillDeep(merged, { ...locationVars(page), ...live, phone: '{phone}' })
}

/** The listing for the page's depot: buy, rental or rent-to-own. */
export function locationListingHref(depot: string, ptype: 'buy' | 'rental' | 'rto' = 'buy'): string {
  const params = new URLSearchParams({ location: depot })
  if (ptype !== 'buy') params.set('ptype', ptype)
  return `${ROUTES.PLP}?${params}`
}

/**
 * The page's SEO defaults for the Page Configurator, from its record
 * (WordPress's title and description, word for word). WordPress's title has
 * no site ending, so it is absolute.
 */
export function locationSeoDefaults(page: LocationPage): PageSeoDefaults {
  const path = locationPath(page.slug)
  return {
    title: page.seo.title,
    absoluteTitle: true,
    description: page.seo.description,
    canonical: path,
    openGraph: { images: [page.seo.ogImage] },
  }
}
