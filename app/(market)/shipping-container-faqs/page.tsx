import { JsonLd } from '@/components/shared/JsonLd'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import { FAQ_GROUPS, FAQS_HERO, faqAnswerText } from '@/lib/data/faqsContent'
import { breadcrumbNode, faqNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { FaqGroupSection } from './_components/FaqGroupSection'
import { FaqsHero } from './_components/FaqsHero'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.FAQS)
}

/**
 * Shipping container FAQs, native since 2026-11-06 at the URL WordPress served
 * it from. Its visible sections in WordPress's order, copy in
 * lib/data/faqsContent.ts. Static; the quote request form is the only client code.
 */
export default function FaqsPage() {
  const faqs = FAQ_GROUPS.flatMap((group) =>
    group.entries.map((entry) => ({ question: entry.question, answer: faqAnswerText(entry.blocks) })),
  )
  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.FAQS,
      name: FAQS_HERO.heading,
      description: PAGE_SEO_DEFAULTS[ROUTES.FAQS]?.description,
    }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: FAQS_HERO.heading }]),
    // From the same list the page renders.
    faqNode(faqs),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.FAQS} />

      <FaqsHero />
      {FAQ_GROUPS.map((group, index) => (
        <FaqGroupSection key={group.id} group={group} withImage={index === 0} />
      ))}
    </div>
  )
}
