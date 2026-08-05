import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { CartPageClient } from './_components/CartPageClient'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.CART)
}

export default function CartPage() {
  return (
    <>
      <PageHeadScripts path={ROUTES.CART} />
      <CartPageClient />
    </>
  )
}
