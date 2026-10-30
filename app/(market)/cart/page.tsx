import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { CART_PAGE_GOES_TO_QUOTE } from '@/lib/checkoutRoute'
import { resolvePageMetadata } from '@/lib/seo'
import { CartPageClient } from './_components/CartPageClient'
import { CartToQuoteRedirect } from './_components/CartToQuoteRedirect'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.CART)
}

/**
 * Temporarily the delivery-quote form instead (CART_PAGE_GOES_TO_QUOTE).
 * CART_PAGE_OPEN=1 keeps the cart page on a server that needs it: the e2e
 * server (playwright.config.ts), whose journeys test the cart itself. Read at
 * build time, as this page is static.
 */
const SHOWS_CART = !CART_PAGE_GOES_TO_QUOTE || process.env.CART_PAGE_OPEN === '1'

export default function CartPage() {
  return (
    <>
      <PageHeadScripts path={ROUTES.CART} />
      {SHOWS_CART ? <CartPageClient /> : <CartToQuoteRedirect />}
    </>
  )
}
