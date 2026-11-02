import { ROUTES } from './routes'

/**
 * Zoho SalesIQ, the live chat bubble the WordPress site carries ("Everyone
 * Qualifies!"). Its look, greeting and routing are set in the Zoho account;
 * this widget code is what connects the site to it. Storefront only: see
 * components/layout/SalesIqChat.tsx.
 */
export const SALES_IQ_WIDGET_CODE = 'siq5653ae22387671d972ab9ed19491efe5e4478724bfefa2f62964fa5740b75521'
export const SALES_IQ_SCRIPT_SRC = 'https://salesiq.zohopublic.com/widget'

/**
 * Storefront pages that leave the chat out until Admin → Live Chat has saved a
 * list, and whenever that list can't be read (lib/salesIq.ts).
 */
export const SALES_IQ_DEFAULT_EXCLUDED_PATHS: readonly string[] = [ROUTES.CART, ROUTES.CHECKOUT]

const MAX_PATH_LENGTH = 200

/**
 * A page path as stored and compared: lower case, leading slash, no domain, query
 * or trailing slash. "https://onsitestorage.com/Blogs/?a=1" → "/blogs". Empty for
 * anything that can't be a path.
 */
export function normalizeSalesIqPath(value: string): string {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return ''
  const bare = trimmed.replace(/^[a-z]+:\/\/[^/?#]*/, '').replace(/[?#].*$/, '').replace(/^\/+|\/+$/g, '')
  const path = `/${bare}`
  return /^\/[a-z0-9\-._~%/]*$/.test(path) && path.length <= MAX_PATH_LENGTH ? path : ''
}

/** A stored list, cleaned up. Anything that isn't a list counts as no list saved. */
export function conformSalesIqPaths(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [...SALES_IQ_DEFAULT_EXCLUDED_PATHS]
  const paths = raw.map((item) => normalizeSalesIqPath(String(item))).filter(Boolean)
  return [...new Set(paths)].sort()
}

/** Is this page on the list? A listed path covers everything beneath it, so `/checkout` includes `/checkout/anything`. */
export function isSalesIqExcludedPath(pathname: string, excludedPaths: readonly string[]): boolean {
  const path = normalizeSalesIqPath(pathname)
  return excludedPaths.some((excluded) => path === excluded || path.startsWith(`${excluded}/`))
}
