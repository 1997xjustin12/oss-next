/**
 * What the Added to Cart dialog offers ("Frequently Bought Together"), in order:
 * the small things a container buyer needs, before the shelters and office kits
 * that the index would otherwise lead with.
 *
 * A rule, not a list of products: each group is matched against product titles
 * and shows its cheapest match (lib/cartUpsell.ts), so a new or delisted product
 * changes the row without a code change. Changing the order is moving a line.
 *
 * Lighting has no products yet (2026-11-03: the "Lighting" category holds one
 * man door), so its group is empty until one is added, and then takes its place.
 */

export const CART_UPSELL_MAX_ITEMS = 8

export const CART_UPSELL_GROUPS: readonly { label: string; title: RegExp }[] = [
  { label: 'Lock box', title: /lock\s*box/i },
  { label: 'Leveling kit', title: /level+ing kit/i },
  { label: 'Jack pads', title: /jack pads?/i },
  { label: 'Jack lug', title: /jack lug/i },
  { label: 'Jack', title: /bottle jack/i },
  { label: 'Padlock', title: /padlock/i },
  { label: 'Door lock', title: /door lock(?! parts)/i },
  { label: 'Lighting', title: /\b(?:lights?|lighting)\b/i },
  { label: 'Vent', title: /\bvents?\b/i },
]
