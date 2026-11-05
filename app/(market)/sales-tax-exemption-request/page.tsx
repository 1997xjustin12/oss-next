import { JsonLd } from '@/components/shared/JsonLd'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { PAGE_SEO_DEFAULTS } from '@/config/pageSeoDefaults'
import { ROUTES } from '@/config/routes'
import { breadcrumbNode, graph, siteNodes, webPageNode } from '@/lib/schema'
import { resolvePageMetadata } from '@/lib/seo'
import { TaxExemptionForm } from './_components/TaxExemptionForm'
import { TaxExemptionHero } from './_components/TaxExemptionHero'
import { TaxExemptionSidebar } from './_components/TaxExemptionSidebar'
import { TaxExemptionSteps } from './_components/TaxExemptionSteps'

const PAGE_NAME = 'Sales Tax Exemption Request'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.TAX_EXEMPTION)
}

/**
 * The sales tax exemption request, native at the URL WordPress served it from.
 * Copy and form wiring are in lib/data/taxExemptionContent.ts. Static: nothing
 * here reads request data, and the form posts straight to Zoho CRM.
 */
export default function TaxExemptionPage() {
  const jsonLd = graph([
    ...siteNodes(),
    webPageNode({
      path: ROUTES.TAX_EXEMPTION,
      name: PAGE_NAME,
      description: PAGE_SEO_DEFAULTS[ROUTES.TAX_EXEMPTION]?.description,
    }),
    breadcrumbNode([{ name: 'Home', path: ROUTES.HOME }, { name: PAGE_NAME }]),
  ])

  // The (market) layout provides <main>.
  return (
    <div className="page-fill bg-white dark:bg-neutral-950">
      <JsonLd data={jsonLd} />
      <PageHeadScripts path={ROUTES.TAX_EXEMPTION} />

      <TaxExemptionHero />
      <TaxExemptionSteps />

      <section aria-label="Request form" className="bg-white px-[5%] py-10 sm:py-14 dark:bg-neutral-950">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          {/* The sidebar comes first so phones show it above the form; from lg it moves beside it. */}
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
            <TaxExemptionSidebar />
          </div>
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <TaxExemptionForm />
          </div>
        </div>
      </section>
    </div>
  )
}
