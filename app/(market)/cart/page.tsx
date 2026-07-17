import type { Metadata } from 'next'
import { ROUTES } from '@/config/routes'
import { CartPageClient } from './_components/CartPageClient'

const TITLE = 'Shopping Cart'
const DESCRIPTION = 'Review your shipping containers and accessories before checkout on On-Site Storage Solutions.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: ROUTES.CART },
  robots: { index: false, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['/images/logo/oss-logo.webp'] },
}

export default function CartPage() {
  return <CartPageClient />
}
