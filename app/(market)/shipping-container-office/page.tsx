import { FixedArticle } from '@/components/blog/FixedArticle'
import { ROUTES } from '@/config/routes'
import { CONTAINER_OFFICE_ARTICLE, CONTAINER_OFFICE_FAQS } from '@/lib/data/containerOfficeContent'
import { resolvePageMetadata } from '@/lib/seo'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.CONTAINER_OFFICE)
}

/**
 * Shipping container offices: a WordPress blog post at the site root that never reached the
 * backend (it 404'd here), kept at its URL as a fixed article
 * (components/blog/FixedArticle.tsx), from the copy in lib/data/containerOfficeContent.ts.
 */
export default function ContainerOfficePage() {
  return <FixedArticle path={ROUTES.CONTAINER_OFFICE} slug="shipping-container-office" article={CONTAINER_OFFICE_ARTICLE} faqs={CONTAINER_OFFICE_FAQS} />
}
