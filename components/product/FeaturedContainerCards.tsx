import { FEATURED_CONTAINERS } from '@/config/featuredContainers'
import { toFeaturedCards } from '@/lib/featuredCards'
import { getNationalFeaturedContainers } from '@/services/search.service'
import { ContainerCardGrid } from './ContainerCardGrid'

/**
 * The homepage's four featured container cards, for any page that shows a row
 * of featured containers (the WordPress pages' "Buy Used 20 ft…" product row).
 *
 * The national listings are rendered into the page, so it stays static; in the
 * browser `ContainerCardGrid` swaps in the visitor's depot (prices wait until it
 * is known), and each card's link carries their ZIP (`PlpLink`). A failed search
 * leaves the cards on their own photos, and the browser asks again.
 */
export async function FeaturedContainerCards() {
  const defaults = await getNationalFeaturedContainers(FEATURED_CONTAINERS.map((item) => item.depotSpec)).catch((err) => {
    console.error('[FeaturedContainerCards] featured lookup failed:', err)
    return []
  })

  return <ContainerCardGrid defaults={toFeaturedCards(defaults)} />
}
