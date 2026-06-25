'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Phone, Star } from 'lucide-react'
import type { Accessory } from '@/types/product'

type Props = { product: Accessory }

const BADGE_CLASSES = {
  red:   'bg-theme-primary',
  amber: 'bg-amber-600',
  green: 'bg-green-600',
} satisfies Record<Accessory['badge']['tone'], string>

export function AccessoryCard({ product }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const href = product.permalink ?? `/product/${product.sku.toLowerCase()}`
  const full = Math.round(product.rating)

  return (
    <article
      onClick={() => { setLoading(true); router.push(href) }}
      className="relative flex flex-col rounded-xl border border-theme-border dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden cursor-pointer transition-all hover:border-theme-primary/50 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 rounded-xl">
          <div className="w-5 h-5 border-[3px] border-theme-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square bg-theme-subtle dark:bg-neutral-800 overflow-hidden">
        <span className={`absolute top-0 left-0 z-10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white rounded-br-lg ${BADGE_CLASSES[product.badge.tone]}`}>
          {product.badge.label}
        </span>
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl select-none">🔧</div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <h3 className="text-sm font-bold leading-snug text-theme-dark dark:text-gray-100 line-clamp-2">
          {product.title}
        </h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 text-xs text-theme-muted dark:text-gray-500">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={10}
                  className={n <= full ? 'fill-theme-primary text-theme-primary' : 'fill-gray-200 text-gray-200'}
                />
              ))}
            </div>
            <span>({product.reviews})</span>
          </div>
        )}

        {product.sku && (
          <div className="text-[10px] text-theme-muted dark:text-gray-600">SKU: {product.sku}</div>
        )}

        <div className="mt-auto pt-2.5 flex items-center justify-between border-t border-theme-border dark:border-neutral-800">
          <div className="text-lg font-black leading-none text-theme-dark dark:text-gray-100">
            ${product.price.toLocaleString()}
          </div>
          <button className="text-xs font-extrabold bg-theme-primary text-white px-3 py-1.5 rounded-md hover:bg-theme-primary-dark transition-colors">
            View
          </button>
        </div>
      </div>

      {/* Phone CTA */}
      <div className="px-3 pb-3">
        <a
          href="tel:8889779085"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-1.5 w-full rounded-md bg-theme-dark dark:bg-neutral-700 text-white text-xs font-bold py-2 hover:bg-black dark:hover:bg-neutral-600 transition-colors"
        >
          <Phone size={11} /> (888) 977-9085
        </a>
      </div>
    </article>
  )
}
