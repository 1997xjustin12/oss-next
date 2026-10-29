/**
 * The GBP template's defaults: the eleven sections in the WordPress order,
 * the theme and the header/footer options. The seed the admin's template
 * screen starts from, and the fallback when Redis has no record. One template
 * for every GBP page.
 *
 * Reference: docs/reference/gbp-subdomain-pages.md ("Admin configurators")
 */

import type { GbpCoreSectionType, GbpTemplate } from '@/types/gbp'

const CORE_ORDER: readonly GbpCoreSectionType[] = [
  'hero',
  'trustedBy',
  'products',
  'reviews',
  'types',
  'resources',
  'whyChoose',
  'about',
  'quote',
  'newsletter',
  'faq',
]

export const GBP_TEMPLATE_DEFAULT: GbpTemplate = {
  // Ids equal the type for the built-in sections: there is one of each.
  sections: CORE_ORDER.map((type) => ({ id: type, type, enabled: true })),
  theme: { brand: '#C60C29', accent: '#FF0000', font: 'poppins' },
  header: { showCallButton: true, background: '#FFFFFF', backgroundDark: '#0A0A0A' },
  footer: { showEmail: true, showAddress: true, showHours: true },
}
