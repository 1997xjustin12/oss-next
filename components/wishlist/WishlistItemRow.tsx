'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Package } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { ROUTES } from '@/config/routes'
import type { WishlistItem } from '@/types/wishlist'

type Props = { item: WishlistItem }

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export function WishlistItemRow({ item }: Props) {
  const { removeItem } = useWishlist()

  return (
    <div className="rounded-xl border border-theme-border bg-white p-4 sm:p-5 hover:border-theme-primary hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-theme-subtle border border-theme-border flex items-center justify-center">
          {item.image ? (
            <Image src={item.image} alt={item.name} width={80} height={80} className="object-cover w-full h-full rounded-lg" />
          ) : (
            <Package className="w-8 h-8 text-theme-muted" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold leading-tight truncate">{item.name}</h3>
          <div className="text-lg font-extrabold mt-1">{fmt(item.price)}</div>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
          <Link
            href={ROUTES.PRODUCT(item.handle)}
            className="rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-4 py-2 text-sm transition-colors whitespace-nowrap"
          >
            View Product
          </Link>
          <button
            onClick={() => removeItem(item.id)}
            className="flex items-center gap-1 text-xs font-semibold text-theme-muted hover:text-theme-primary transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
