/**
 * The location-page admin screens' form models, shared by the server screens
 * and the client editors (app/admin/location-pages), so the two agree on what a
 * form holds and how it maps back to the stored record (validated on save by
 * lib/locationValidate.ts).
 *
 * Pure, and client-safe: types and constants only.
 */

import type { LocationLinkKey, LocationPage, LocationSectionId, LocationTemplate, LocationTemplateText } from '@/types/locationPage'

/** What each section is called in the admin. */
export const LOCATION_SECTION_LABELS: Record<LocationSectionId, string> = {
  hero: 'Hero (h1, tagline, call button)',
  budgetBand: 'Red band ("We have containers for every budget")',
  options: 'Buy / Rent / Rent-To-Own cards',
  products: 'Top-selling products row',
  buy: 'Buy section (cities, map)',
  delivered: 'Delivery photos',
  satisfaction: 'Satisfaction guarantee + reviews',
  callBand: 'Blue call band',
  featured: 'Featured story',
  news: 'News & updates story',
  video: 'Video',
  overview: 'Portable storage overview',
  purchase: 'Purchase block',
  rental: 'Rental block',
  rto: 'Rent-To-Own block',
  closingBand: 'Closing band ("Ready to purchase?")',
  resources: 'Resource articles',
  pricingForm: 'Pricing form (Zoho)',
  newsletter: 'Newsletter signup',
  faq: 'FAQ (with video)',
}

export const LOCATION_LINK_LABELS: Record<LocationLinkKey, string> = {
  products: '"Shop All Products" button',
  buy: 'Buy section button',
  purchase: 'Purchase block button',
  rental: 'Rental block button',
  rto: 'Rent-To-Own block button',
}

/** Every template text field as a full, blank form: what a location's overrides are edited in. */
export type TextForm = { [K in keyof LocationTemplateText]: LocationTemplateText[K] extends string ? string : { [F in keyof LocationTemplateText[K]]: string } }

/** A location as its editor holds it: every optional field present, so the form shows it. */
export type LocationPageForm = Omit<LocationPage, 'slug' | 'text' | 'phone' | 'sections' | 'productSpecs' | 'links' | 'resources' | 'faqYoutubeId'> & {
  phone: string
  sections: LocationPage['sections'] | null
  productSpecs: NonNullable<LocationPage['productSpecs']>
  links: Record<LocationLinkKey, string>
  text: TextForm
  resources: NonNullable<LocationPage['resources']>
  faqYoutubeId: string
}

export function toLocationPageForm(page: LocationPage, template: LocationTemplate): LocationPageForm {
  const text = Object.fromEntries(
    Object.entries(template.text).map(([group, base]) => {
      const own = (page.text as Record<string, unknown> | undefined)?.[group]
      if (typeof base === 'string') return [group, typeof own === 'string' ? own : '']
      return [group, Object.fromEntries(Object.keys(base).map((field) => [field, (own as Record<string, string> | undefined)?.[field] ?? '']))]
    }),
  ) as TextForm
  // The slug is the record's identity and the overrides become the full form below.
  const rest: Partial<LocationPage> = { ...page }
  delete rest.slug
  delete rest.text
  return {
    ...(rest as Omit<LocationPage, 'slug' | 'text'>),
    phone: page.phone ?? '',
    sections: page.sections ?? null,
    productSpecs: page.productSpecs ?? [],
    links: { products: '', buy: '', purchase: '', rental: '', rto: '', ...page.links },
    text,
    resources: page.resources ?? [],
    faqYoutubeId: page.faqYoutubeId ?? '',
  }
}
