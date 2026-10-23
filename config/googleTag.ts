/**
 * Google Tag Manager, per environment.
 *
 * One container (GTM-5X9C5P6) with two environments: the live site loads it
 * plainly, staging loads it through GTM's "Staging" environment (gtm_auth /
 * gtm_preview), so tags can be tested there before they are published live.
 * Snippets as supplied: docs/google-tag-live.md and docs/google-tag-staging.md.
 *
 * Which one runs is decided by the hostname of BASE_URL (NEXT_PUBLIC_BASE_URL),
 * matched exactly. Anything else — localhost, Vercel preview URLs, the
 * oss-next.vercel.app fallback — loads no tag at all, so test traffic never
 * reaches either environment.
 */
import { BASE_URL } from '@/lib/helpers'

export const GTM_ID = 'GTM-5X9C5P6'

export type GtmEnvironment = 'live' | 'staging'

const HOSTS: Record<string, GtmEnvironment> = {
  'onsitestorage.com': 'live',
  'staging.onsitestorage.com': 'staging',
}

/** Extra query string GTM needs for each environment ('' for live). */
export const GTM_ENV_PARAMS: Record<GtmEnvironment, string> = {
  live: '',
  staging: '&gtm_auth=OKoEg3jdJa78B0uobyXVyA&gtm_preview=env-79&gtm_cookies_win=x',
}

/**
 * The GTM environment for a base URL, or null for none.
 *
 * Exact hostname match, not "contains": `staging.onsitestorage.com` must not
 * count as live, and lookalikes such as `onsitestorage.com.example.net` or
 * `notonsitestorage.com` must match nothing. Case, a leading `www.`, a
 * trailing dot, a port, a path and a missing scheme are all tolerated.
 */
export function gtmEnvironmentFor(baseUrl: string | undefined): GtmEnvironment | null {
  const raw = baseUrl?.trim()
  if (!raw) return null
  let host: string
  try {
    host = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`).hostname
  } catch {
    return null
  }
  host = host.toLowerCase().replace(/\.$/, '').replace(/^www\./, '')
  return HOSTS[host] ?? null
}

/**
 * This deployment's environment, from NEXT_PUBLIC_BASE_URL at build time.
 * Unset, BASE_URL falls back to oss-next.vercel.app, which matches nothing.
 */
export const GTM_ENVIRONMENT = gtmEnvironmentFor(BASE_URL)
