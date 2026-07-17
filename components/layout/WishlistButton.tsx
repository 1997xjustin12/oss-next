'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { ROUTES } from '@/config/routes'

export function WishlistButton() {
  const { items } = useWishlist()

  return (
    <Link
      href={ROUTES.WISHLIST}
      aria-label={`View wishlist — ${items.length} saved item${items.length !== 1 ? 's' : ''}`}
      className="relative flex items-center justify-center px-1.5 text-theme-muted transition-colors hover:text-theme-primary"
    >
      <Heart className="w-5.5 h-5.5" />
      {items.length > 0 && (
        <span className="absolute -top-1 -right-0.5 bg-theme-primary text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center leading-none">
          {items.length > 99 ? '99+' : items.length}
        </span>
      )}
    </Link>
  )
}
