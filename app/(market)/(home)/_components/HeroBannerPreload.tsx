import { getImageProps } from 'next/image'
import { preload } from 'react-dom'
import { BANNER_IMAGE } from './heroBanner'

/**
 * Starts the phone banner download with the page's first bytes.
 *
 * The hero used to sit behind a Suspense boundary (it read the A/B variant
 * from a request header), so its <img>, and the preload next/image emits for
 * it, arrived at the very end of the HTML (byte ~188,000 of ~199,000 on
 * 2026-10-20). Each variant is now a static page and the hero is no longer
 * streamed, but this still earns its place: it puts a phone-only,
 * media-scoped preload in <head>, ahead of everything in the body.
 *
 * Phones and tablets only (`max-width: 1023px`): below 1024px every variant
 * sizes the banner to 100vw, so this preload picks exactly the file the hero
 * then renders and nothing downloads twice. Above it the variants differ (60vw
 * or 100vw), so desktop keeps next/image's own preload, where LCP is already
 * fine. Built with getImageProps so the URLs match next/image's byte for byte.
 */
export function HeroBannerPreload() {
  const { props } = getImageProps({
    src: BANNER_IMAGE,
    alt: '',
    fill: true,
    sizes: '100vw',
  })

  preload(props.src, {
    as: 'image',
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    fetchPriority: 'high',
    media: '(max-width: 1023px)',
  })

  return null
}
