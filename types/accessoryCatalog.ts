/** Shapes for the native accessories page (/shipping-container-accessory-products). */

/** What one product card shows, mapped from a search hit by hitToAccessoryCard(). */
export type AccessoryCardData = {
  id: string
  handle: string
  title: string
  price: number
  imageUrl?: string
  imageAlt: string
  /** variants[0].qty of at least 1. */
  inStock: boolean
  /** The product's most specific category, for the card's label. */
  category: string
}
