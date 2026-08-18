import type { MetadataRoute } from 'next'
import { CRAWLERS, DISALLOWED_PATHS } from '@/config/crawlers'
import { SITE_URL } from '@/config/site'

/**
 * robots.txt, generated from the crawler policy in config/crawlers.ts.
 *
 * The rule list is derived rather than written out here so that the *reason*
 * for each entry lives next to the entry itself. Adding or flipping a crawler
 * is a one-line change in that file; this route needs no edit.
 *
 * Rule shape, per crawler:
 *   allowed  -> Allow: /  plus the shared private-path disallows
 *   blocked  -> Disallow: /   (no Allow line — an Allow would partially undo it)
 *
 * The catch-all `*` rule stays last so a named agent's more specific rule wins
 * under the standard's longest-match semantics.
 */
export default function robots(): MetadataRoute.Robots {
  const disallow = [...DISALLOWED_PATHS]

  const namedRules = CRAWLERS.map((crawler) =>
    crawler.allow
      ? { userAgent: crawler.userAgent, allow: '/', disallow }
      : { userAgent: crawler.userAgent, disallow: '/' },
  )

  return {
    rules: [
      ...namedRules,
      // Everything not named above: allowed, minus the private paths. Keeping
      // the default permissive means a new legitimate crawler is not blocked
      // by omission — the named entries carry the deliberate decisions.
      { userAgent: '*', allow: '/', disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
