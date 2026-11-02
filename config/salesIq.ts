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
 * Storefront pages that never show the chat. Add a path to exclude a page; it
 * covers everything beneath it too, so `/checkout` includes `/checkout/anything`.
 */
export const SALES_IQ_EXCLUDED_PATHS: readonly string[] = [ROUTES.CART, ROUTES.CHECKOUT]

export function isSalesIqExcludedPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/'
  return SALES_IQ_EXCLUDED_PATHS.some((excluded) => path === excluded || path.startsWith(`${excluded}/`))
}
