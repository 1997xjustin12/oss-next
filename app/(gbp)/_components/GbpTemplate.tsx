import type { ReactNode } from 'react'
import { ReviewsSection } from '@/components/shared/ReviewsSection'
import { gbpTelHref } from '@/lib/gbp'
import { GbpAbout } from './GbpAbout'
import { GbpFaq } from './GbpFaq'
import { GbpFooter } from './GbpFooter'
import { GbpHeader } from './GbpHeader'
import { GbpHero } from './GbpHero'
import { GbpNewsletter } from './GbpNewsletter'
import { GbpProducts } from './GbpProducts'
import { GbpQuote } from './GbpQuote'
import { GbpResources } from './GbpResources'
import { GbpTrustedBy } from './GbpTrustedBy'
import { GbpTypes } from './GbpTypes'
import { GbpWhyChoose } from './GbpWhyChoose'
import { GBP_ACCENT, GBP_BG_WHITE, sectionVars, themeVars } from './gbpStyles'
import { GbpLibrarySection } from './sections/GbpLibrarySection'
import type { Review } from '@/config/reviews'
import type { GbpCoreSectionType, GbpLibrarySectionType, GbpPage, GbpSectionInstance, GbpSharedContent, GbpTemplate as Template } from '@/types/gbp'

type Props = {
  page: GbpPage
  shared: GbpSharedContent
  template: Template
  reviews: Review[]
}

type Ctx = Props & { call: { phone: string; telHref: string } }

/**
 * The built-in sections, by type: what each renders from the page, the shared
 * content and its own style. The template's `sections` list decides which
 * appear and in what order (default: the WordPress order,
 * lib/data/gbpTemplate.ts).
 */
const CORE: Record<GbpCoreSectionType, (ctx: Ctx, section: GbpSectionInstance) => ReactNode> = {
  hero: ({ page, shared, call }, { style }) => <GbpHero heading={page.headings.hero} content={shared.hero} style={style} {...call} />,
  trustedBy: ({ page, shared }, { style }) => <GbpTrustedBy heading={page.headings.trustedBy} logos={shared.trustedLogos} style={style} />,
  products: ({ page, shared, call }, { style }) => (
    <GbpProducts heading={page.headings.products} cards={shared.productCards} style={style} {...call} />
  ),
  reviews: ({ shared, reviews }, { style }) => (
    // ReviewsSection is shared with the storefront; the section's style rides
    // on a wrapper as custom properties, read by the classes passed in.
    <div style={sectionVars(style)}>
      <ReviewsSection
        heading={shared.reviewsHeading}
        reviews={reviews}
        className={GBP_BG_WHITE}
        headingClassName="text-2xl leading-[1.1] text-[var(--gbp-heading,#000000)] md:text-[30px]"
        accentClassName={GBP_ACCENT}
      />
    </div>
  ),
  types: ({ page, shared, call }, { style }) => (
    <GbpTypes heading={page.headings.types} types={shared.containerTypes} style={style} {...call} />
  ),
  resources: ({ page }, { style }) => <GbpResources heading={page.headings.resources} cards={page.blogCards} style={style} />,
  whyChoose: ({ shared }, { style }) => <GbpWhyChoose content={shared.whyChoose} style={style} />,
  about: ({ page, shared, call }, { style }) => <GbpAbout paragraphs={page.about} content={shared.about} style={style} {...call} />,
  quote: ({ page, shared }, { style }) => (
    <GbpQuote heading={shared.quote.heading} mapEmbedUrl={page.mapEmbedUrl} city={page.location.city} style={style} />
  ),
  newsletter: ({ shared }, { style }) => <GbpNewsletter content={shared.newsletter} style={style} />,
  faq: ({ page, shared }, { style }) => (
    <GbpFaq heading={shared.faqHeading} faqs={page.faqs} youtubeId={page.youtubeId} city={page.location.city} style={style} />
  ),
}

function renderSection(ctx: Ctx, section: GbpSectionInstance): ReactNode {
  if (section.type in CORE) return CORE[section.type as GbpCoreSectionType](ctx, section)
  if (!section.props) return null
  return (
    <GbpLibrarySection
      type={section.type as GbpLibrarySectionType}
      props={section.props}
      page={ctx.page}
      telHref={ctx.call.telHref}
      style={section.style}
    />
  )
}

/**
 * The one template every GBP location page renders: header, the template's
 * sections in order, footer. Everything per page comes from `page`, what all
 * pages share from `shared`, and the layout and look from `template`.
 * Reference: docs/reference/gbp-subdomain-pages.md ("Page anatomy",
 * "Admin configurators").
 */
export function GbpTemplate(props: Props) {
  const { page, shared, template } = props
  const ctx: Ctx = { ...props, call: { phone: page.contact.phone, telHref: gbpTelHref(page) } }

  return (
    <div className="flex flex-1 flex-col" style={themeVars(template.theme)}>
      <GbpHeader {...ctx.call} content={shared.header} options={template.header} />
      <main className="flex-1">
        {template.sections
          .filter((section) => section.enabled)
          .map((section) => (
            <div key={section.id} data-gbp-section={section.type} className="contents">
              {renderSection(ctx, section)}
            </div>
          ))}
      </main>
      <GbpFooter contact={page.contact} telHref={ctx.call.telHref} content={shared.footer} logo={shared.header.logo} options={template.footer} />
    </div>
  )
}
