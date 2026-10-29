import type { CSSProperties } from 'react'
import type { GbpSectionStyle, GbpTemplate } from '@/types/gbp'

/**
 * Shared class strings and style helpers for the GBP template.
 *
 * Colours and type are hex and px values written into each class, measured
 * from the WordPress pages (Elementor: 30px headings, 24px on phones; tablet
 * matches desktop). Not theme tokens in globals.css: these pages carry their
 * own styling, so a stale or shared stylesheet can't drop it.
 *
 * Admin-chosen values (the template's theme, a section's style) can't be
 * Tailwind classes, which only exist for values in the source. They arrive as
 * CSS custom properties, set by `themeVars` on the template and `sectionVars`
 * on each section, and the classes read them with today's values as the
 * fallback, so with nothing set the page renders exactly as before:
 *
 *   --gbp-brand          buttons, bands, blog titles   (#C60C29)
 *   --gbp-accent         `[[…]]` heading runs            (#FF0000)
 *   --gbp-section-bg     a section's background          (its own default)
 *   --gbp-section-bg-dark
 *   --gbp-heading        a section's headings            (#000 / #fff)
 *   --gbp-heading-dark
 */

/** The content box: 1400px, centred, as WordPress's Elementor container (exempt from AGENTS.md §14). */
export const GBP_CONTAINER = 'mx-auto w-full max-w-[1400px] px-4 sm:px-6'

/** An accented heading run. WordPress writes it as `color: red`, pure #FF0000. */
export const GBP_ACCENT = 'text-[var(--gbp-accent,#FF0000)] dark:text-red-400'

/** Heading colour, overridable per section. */
export const GBP_HEADING = 'text-[var(--gbp-heading,#000000)] dark:text-[var(--gbp-heading-dark,#ffffff)]'

/** Section heading: 30px bold (24px on phones), centred. */
export const GBP_H2 = `text-center text-2xl font-bold leading-[1.1] md:text-[30px] ${GBP_HEADING}`

/** The red button's colours (call buttons, Request a Quote, Submit). */
export const GBP_BUTTON =
  'bg-[var(--gbp-brand,#C60C29)] text-white transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-[var(--gbp-brand,#C60C29)] dark:focus-visible:outline-white'

/** Brand-red text (blog titles, icons, links). */
export const GBP_BRAND_TEXT = 'text-[var(--gbp-brand,#C60C29)] dark:text-red-400'

/** A white section (most of them), overridable per section. */
export const GBP_BG_WHITE = 'bg-[var(--gbp-section-bg,#ffffff)] dark:bg-[var(--gbp-section-bg-dark,#0a0a0a)]'

/** A red band (Why Choose Us, newsletter), overridable per section. */
export const GBP_BG_RED = 'bg-[var(--gbp-section-bg,var(--gbp-brand,#C60C29))] dark:bg-[var(--gbp-section-bg-dark,#7a0718)]'

const PADDING = { none: 'py-0', sm: 'py-6', md: 'py-12', lg: 'py-20' } as const

/** The section's vertical padding: the admin's choice, or the section's own default. */
export function sectionPadding(style: GbpSectionStyle | undefined, fallback: string): string {
  return style?.paddingY ? PADDING[style.paddingY] : fallback
}

type Vars = CSSProperties & Record<`--${string}`, string>

/** A section's admin style as custom properties (only the ones set). */
export function sectionVars(style: GbpSectionStyle | undefined): Vars | undefined {
  if (!style) return undefined
  const vars: Vars = {}
  if (style.background) vars['--gbp-section-bg'] = style.background
  if (style.backgroundDark) vars['--gbp-section-bg-dark'] = style.backgroundDark
  if (style.heading) vars['--gbp-heading'] = style.heading
  if (style.headingDark) vars['--gbp-heading-dark'] = style.headingDark
  if (style.accent) vars['--gbp-accent'] = style.accent
  return Object.keys(vars).length ? vars : undefined
}

/** The template's theme as custom properties and font, on the page's outer element. */
export function themeVars(theme: GbpTemplate['theme']): Vars {
  return {
    '--gbp-brand': theme.brand,
    '--gbp-accent': theme.accent,
    // Poppins is the (gbp) layout's own face; Roboto is the storefront's, already on <html>.
    ...(theme.font === 'roboto' ? { fontFamily: 'var(--font-roboto), Roboto, Arial, sans-serif' } : {}),
  }
}
