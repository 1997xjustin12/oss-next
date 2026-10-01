/**
 * Curated gallery photographs, overriding the ones on the product record.
 *
 * ## How they get on a page
 *
 * Drop files into `public/resources/pdp-images/` named after the specs they
 * show — the same stem the resources and the walkaround videos use — with a
 * number for the running order:
 *
 *   public/resources/pdp-images/new_20s_iicl_1.webp
 *   public/resources/pdp-images/new_20s_iicl_2.webp
 *   public/resources/pdp-images/used_40h_wwt_1.webp
 *
 * That is the whole workflow. `npm run dev` and `npm run build` refresh the
 * manifest and the gallery uses them on the next render.
 *
 * ## Override, not addition
 *
 * A stem with any files **replaces** the product's own photographs entirely,
 * which is what a content manager picking the shots means by overriding them.
 * Worth knowing what that hides: the record's images can be depot-specific,
 * and a curated set is one set for every depot selling that spec.
 *
 * A stem with no files is the ordinary case — the gallery falls back to the
 * product's own images exactly as before, so this is additive to the catalogue
 * rather than a migration away from it.
 *
 * ## Why a manifest
 *
 * Same reason as the videos: the gallery is a Client Component and a browser
 * cannot stat a directory, and on a serverless deploy `public/` is served by
 * the CDN rather than sitting on the lambda's disk. The listing is captured at
 * build time instead — see scripts/generate-pdp-resources.mjs.
 */

/** Site-absolute, because these are served from `public/`. */
export const CONTAINER_IMAGE_DIR = '/resources/pdp-images'

/** `.webp` first, but any of these are picked up. */
export const CONTAINER_IMAGE_EXTENSIONS = ['webp', 'jpg', 'jpeg', 'png'] as const

/**
 * `<stem>_<n>.<ext>` — the trailing number is the running order.
 *
 * Anchored and strict so a file that does not follow the convention is ignored
 * rather than landing in the middle of someone's gallery: `new_20s_iicl_2.webp`
 * matches, `new_20s_iicl_2_final.webp` does not.
 */
export const CONTAINER_IMAGE_PATTERN = /^(.+)_(\d+)\.([a-z]+)$/i
