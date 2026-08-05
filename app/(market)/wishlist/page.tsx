import { ROUTES } from '@/config/routes'
import { PageHeadScripts } from '@/components/shared/PageHeadScripts'
import { resolvePageMetadata } from '@/lib/seo'
import { WishlistPageClient } from './_components/WishlistPageClient'

export function generateMetadata() {
  return resolvePageMetadata(ROUTES.WISHLIST)
}

export default function WishlistPage() {
  return (
    <>
      <PageHeadScripts path={ROUTES.WISHLIST} />
      <WishlistPageClient />
    </>
  )
}
