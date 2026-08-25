import { getCustomFieldValue } from '@/lib/pricing'
import { isHighCube, sizeFeet } from '@/lib/productTitle'
import type { ShippingContainerHit } from '@/types/product'

/**
 * The key a product's videos are stored under — `20`, `40`, `40HC`, and so on.
 *
 * Built from the same two fields the size selector reads, through the same
 * helpers, so a product can never be shown one size in the picker and another
 * size's videos. `isHighCube` matters here: the height field stores high cube
 * with curly quotes, so testing the measurement directly would silently never
 * match. See lib/productTitle.ts.
 *
 * Returns `''` when the length is unknown, which callers treat as "no key" and
 * fall back to the default list.
 */
export function videoSizeKey(hit: ShippingContainerHit): string {
  const feet = sizeFeet(getCustomFieldValue(hit, 'length_width'))
  if (!feet) return ''

  return `${feet}${isHighCube(getCustomFieldValue(hit, 'height')) ? 'HC' : ''}`
}

/** The poster frame YouTube serves for a video. */
export function youTubePoster(id: string): string {
  // hqdefault exists for every video; maxresdefault does not, and a missing one
  // returns a grey placeholder image rather than a 404 you could detect.
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

/**
 * The privacy-preserving embed URL.
 *
 * `youtube-nocookie.com` is the domain that doesn't set advertising cookies
 * until playback begins — which also keeps this out of consent-banner scope in
 * most readings. `autoplay=1` is safe because the iframe is only ever created
 * by a click.
 */
export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
}
