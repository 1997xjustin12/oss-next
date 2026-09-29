/**
 * Self-hosted walkaround videos for the product gallery.
 *
 * ## How a video gets on a page
 *
 * Drop a file into `public/resources/pdp-videos/` named after the specs it shows,
 * using the same stem the PDP resources use — `<condition>_<size>_<grade>`:
 *
 *   public/resources/pdp-videos/new_20s_iicl.mp4
 *   public/resources/pdp-videos/used_40h_wwt.mp4
 *
 * That is the whole workflow. `npm run dev` and `npm run build` both refresh
 * the manifest, and the next render picks it up as the gallery's first slide.
 * Nothing below needs editing for a video to appear.
 *
 * A stem with no file is the normal case, not an error: the gallery renders
 * images only, with no empty frame and no request for a file that is not there.
 * Because the manifest is a checked-in list of what exists, that decision is
 * made before anything is rendered rather than by waiting for a 404.
 *
 * ## Why a manifest rather than a filesystem check
 *
 * The gallery is a Client Component and a browser cannot stat a directory. On
 * a serverless deploy the server cannot be relied on to either — `public/` is
 * served by the CDN and is not guaranteed to be on the lambda's disk. The
 * directory listing is therefore captured at build time and shipped as data,
 * exactly as `lib/data/pdpResourceManifest.ts` already does for the resource
 * row. See scripts/generate-pdp-resources.mjs.
 *
 * ## This file
 *
 * Only for what a filename cannot carry. Every field is optional, and the
 * defaults are good enough that most videos will never need an entry.
 */

/** Playable by every browser this storefront supports, best first. */
export const CONTAINER_VIDEO_EXTENSIONS = ['mp4', 'webm'] as const

/** A still with the same stem is used as the poster frame when one exists. */
export const CONTAINER_VIDEO_POSTER_EXTENSIONS = ['webp', 'jpg', 'jpeg', 'png'] as const

/** Site-absolute, because these are served from `public/`. */
export const CONTAINER_VIDEO_DIR = '/resources/pdp-videos'

export type ContainerVideoMeta = {
  /**
   * The video's accessible name — the thumbnail's label and what a screen
   * reader announces.
   *
   * Defaults to a description built from the product's own specs, which is
   * usually right. Set it when the video shows something the specs do not say.
   */
  title?: string
  /**
   * Poster frame, if it is not a still of the same name in the same folder.
   *
   * Site-absolute (`/images/...`). Without either, the gallery falls back to
   * the product's first photograph, so there is always something to show
   * before playback.
   */
  poster?: string
  /** e.g. `0:42`. Rendered as a badge on the thumbnail when set. */
  duration?: string
}

/**
 * Per-slug overrides, keyed by the same stem as the filename.
 *
 * Empty by design. An entry here is only needed to override a default — a
 * video with no entry still plays, which is why nothing has to be registered
 * before dropping a file in.
 *
 * @example
 * export const CONTAINER_VIDEO_META: Record<string, ContainerVideoMeta> = {
 *   new_20s_iicl: {
 *     title: 'Walkaround of a new 20ft IICL container',
 *     duration: '0:42',
 *   },
 * }
 */
export const CONTAINER_VIDEO_META: Record<string, ContainerVideoMeta> = {}

/** A video resolved for a product, ready to render. */
export type ContainerVideo = {
  /** The stem it was found under, e.g. `new_20s_iicl`. */
  slug: string
  /** Site-absolute url of the video file. */
  src: string
  /** Poster frame, or null to fall back to the product's first image. */
  poster: string | null
  title: string
  duration?: string
}
