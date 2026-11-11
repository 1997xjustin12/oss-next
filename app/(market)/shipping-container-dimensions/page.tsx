import { FixedArticle } from '@/components/blog/FixedArticle'
import { ROUTES } from '@/config/routes'
import { CONTAINER_DIMENSIONS_ARTICLE, CONTAINER_DIMENSIONS_FAQS } from '@/lib/data/containerDimensionsContent'
import { resolvePageMetadata } from '@/lib/seo'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.CONTAINER_DIMENSIONS)
}

/**
 * Shipping container dimensions: a WordPress blog post at the site root, kept at
 * its URL as a fixed article because it never reached the backend
 * (components/blog/FixedArticle.tsx), from the copy in
 * lib/data/containerDimensionsContent.ts.
 */
export default function ContainerDimensionsPage() {
  return (
    <FixedArticle
      path={ROUTES.CONTAINER_DIMENSIONS}
      slug="shipping-container-dimensions"
      article={CONTAINER_DIMENSIONS_ARTICLE}
      faqs={CONTAINER_DIMENSIONS_FAQS}
    />
  )
}
