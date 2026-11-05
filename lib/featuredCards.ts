/** What a homepage container card takes from the catalogue. */
export type FeaturedCardData = {
  image: string
  /** Null when the listing has no real price: no price is better than "$0.00". */
  price: number | null
}

export type FeaturedCards = Record<string, FeaturedCardData>

type FeaturedEntry = {
  spec: { key: string }
  product: { sale_price?: unknown; images?: unknown }
}

/**
 * The featured lookup's answer, cut down to what the cards show and keyed by
 * spec. Used on both sides of the network: on the server so the full listings
 * stay out of the page's props, and in the browser for a visitor's own depot.
 */
export function toFeaturedCards(entries: readonly FeaturedEntry[]): FeaturedCards {
  return Object.fromEntries(
    entries.map(({ spec, product }) => {
      const images = product.images as { src?: string }[] | undefined
      const price = Number(product.sale_price)
      return [spec.key, { image: images?.[0]?.src ?? '', price: price > 0 ? price : null }]
    }),
  )
}
