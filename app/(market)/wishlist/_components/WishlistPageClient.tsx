'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'
import { ROUTES } from '@/config/routes'
import { WishlistItemRow } from '@/components/wishlist/WishlistItemRow'

export function WishlistPageClient() {
  const { items } = useWishlist()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Hydration-safe mount detection — wishlist data is client-only
    // (localStorage), so the server render and first client render must
    // intentionally differ. Same accepted pattern already used on /cart.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <section className="px-[5%] py-8 sm:py-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-2.5 mb-1.5">
        <Heart className="w-7 h-7 text-theme-primary shrink-0" />
        My Wishlist
        {mounted && items.length > 0 && (
          <span className="text-base sm:text-lg font-normal text-theme-muted">
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        )}
      </h1>
      <p className="text-xs text-theme-muted mb-5">
        Saved to this browser only — it won&apos;t follow you to another device yet.
      </p>

      {!mounted ? (
        <WishlistSkeleton />
      ) : items.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <div className="flex flex-col gap-3.5">
          {items.map((item) => (
            <WishlistItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}

function EmptyWishlist() {
  return (
    <div className="rounded-xl border border-theme-border bg-white p-10 sm:p-16 text-center">
      <Heart className="w-14 h-14 mx-auto text-theme-border mb-4" />
      <h2 className="text-2xl font-bold mb-1.5">Your wishlist is empty</h2>
      <p className="text-sm text-theme-muted mb-6 max-w-xs mx-auto">
        Save containers you&apos;re considering — tap the heart on any product page.
      </p>
      <Link
        href={ROUTES.PLP}
        className="rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-6 py-3 text-sm transition-colors inline-block"
      >
        Browse Containers
      </Link>
    </div>
  )
}

function WishlistSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 sm:h-28 rounded-xl border border-theme-border bg-theme-subtle" />
      ))}
    </div>
  )
}
