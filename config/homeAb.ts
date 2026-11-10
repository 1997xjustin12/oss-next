/**
 * The homepage A/B/C test. The proxy assigns each visitor a variant and rewrites
 * `/` to its prebuilt page (handleAbTest in proxy.ts); the page's own analytics
 * are lib/homeAb.ts, reported in /admin/home-ab.
 */

/** The variants. Variant 1 is the control. */
export const HOME_VARIANTS = [1, 2, 3] as const
export type HomeVariant = (typeof HOME_VARIANTS)[number]

/**
 * `/?version=2`: a public preview of one variant, for showing a design to the
 * client. It does not enrol anyone, is sent noindex, and is never recorded by
 * the analytics.
 */
export const HOME_PREVIEW_PARAM = 'version'

/** Where the tracker sends its reports (app/api/ab/home/route.ts). */
export const HOME_AB_REPORT_PATH = '/api/ab/home'
