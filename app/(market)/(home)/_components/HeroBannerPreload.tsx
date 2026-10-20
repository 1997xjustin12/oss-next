import { getImageProps } from 'next/image'
import { preload } from 'react-dom'
import { BANNER_IMAGE } from './heroBanner'

/**
 * Starts the phone banner download with the page's first bytes.
 *
 * The hero sits behind a Suspense boundary — it reads the visitor's A/B
 * variant from a request header — so its <img>, and the preload next/image
 * emits for it, arrive in the streamed part at the very end of the HTML
 * (byte ~188,000 of ~199,000 on 2026-10-20). On a slow phone connection the
 * banner, the page's LCP, could not start downloading until nearly the whole
 * document had. This component sits in the static shell instead, so the
 * preload lands in <head>.
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
