import type { Metadata } from 'next'
import { ROUTES } from '@/config/routes'
import { WishlistPageClient } from './_components/WishlistPageClient'

const TITLE = 'My Wishlist'
const DESCRIPTION = 'Containers and accessories you\'ve saved for later on On-Site Storage Solutions.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: ROUTES.WISHLIST },
  robots: { index: false, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/images/logo/oss-logo.webp'] },
}

export default function WishlistPage() {
  return <WishlistPageClient />
}
