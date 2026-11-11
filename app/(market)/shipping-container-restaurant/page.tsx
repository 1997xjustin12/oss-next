import { FixedArticle } from '@/components/blog/FixedArticle'
import { ROUTES } from '@/config/routes'
import { CONTAINER_RESTAURANT_ARTICLE, CONTAINER_RESTAURANT_FAQS } from '@/lib/data/containerRestaurantContent'
import { resolvePageMetadata } from '@/lib/seo'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.CONTAINER_RESTAURANT)
}

/**
 * Shipping container restaurants: a WordPress blog post at the site root that never reached the
 * backend (it 404'd here), kept at its URL as a fixed article
 * (components/blog/FixedArticle.tsx), from the copy in lib/data/containerRestaurantContent.ts.
 */
export default function ContainerRestaurantPage() {
  return <FixedArticle path={ROUTES.CONTAINER_RESTAURANT} slug="shipping-container-restaurant" article={CONTAINER_RESTAURANT_ARTICLE} faqs={CONTAINER_RESTAURANT_FAQS} />
}
