'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, ShoppingCart, MapPin } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { getCustomFieldValue } from '@/lib/pricing'
import { DEFAULT_LOCATION } from '@/lib/constants'
import type { CartItem } from '@/types/cart'
import type { ProductHit } from '@/types/product'

type Props = {
  item:    CartItem | null
  onClose: () => void
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

// Chip row for container specs (size, grade, condition, location) — same
// custom_fields keys QuickViewModal.tsx reads, just condensed into pills
// instead of a bulleted list to fit this smaller dialog.
function SpecChips({ item }: { item: CartItem }) {
  const hit = item.rawHit
  const location = item.location ?? (hit ? getCustomFieldValue(hit, 'location') : '')

  const specs = [
    { label: 'Size', value: item.size ?? (hit ? getCustomFieldValue(hit, 'length_width') : '') },
    { label: 'Grade', value: hit ? getCustomFieldValue(hit, 'grade') : '' },
    { label: 'Condition', value: item.condition ?? (hit ? getCustomFieldValue(hit, 'condition') : '') },
    // "Various North America" is a generic-display placeholder, not a real depot.
    { label: 'Location', value: location && location !== DEFAULT_LOCATION ? location : '' },
  ].filter((s) => s.value)

  if (specs.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {specs.map((s) => (
        <span
          key={s.label}
          className="inline-flex items-center gap-1 rounded-full border border-theme-border bg-theme-subtle dark:border-neutral-700 dark:bg-neutral-800 px-2.5 py-1 text-xs text-theme-mid dark:text-gray-300"
        >
          {s.label === 'Location' && <MapPin className="w-3 h-3 shrink-0" />}
          <span className="font-semibold text-theme-dark dark:text-white">{s.label}:</span> {s.value}
        </span>
      ))}
    </div>
  )
}

function AccessoryCardSkeleton() {
  return (
    <div className="snap-start shrink-0 w-32 animate-pulse">
      <div className="w-32 h-32 rounded-lg bg-theme-subtle dark:bg-neutral-800 border border-theme-border dark:border-neutral-700" />
      <div className="h-2.5 w-3/4 bg-theme-subtle dark:bg-neutral-800 rounded mt-2" />
      <div className="h-2.5 w-1/2 bg-theme-subtle dark:bg-neutral-800 rounded mt-1.5" />
    </div>
  )
}

// Generic accessory upsell row — reuses the same ES-backed /api/search route
// the PLP's instant search calls, filtered to productType: 'accessories' (any
// category that isn't Shipping Containers/Generic Product Page). No pairing
// logic with the item just added — just a basic accessory sampler, per spec.
function FrequentlyBought({ onNavigate }: { onNavigate: () => void }) {
  const [products, setProducts] = useState<ProductHit[] | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{ indexName: 'accessories', params: { productType: 'accessories', hitsPerPage: 8, page: 0 } }],
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { results?: { hits?: ProductHit[] }[] } | null) => {
        if (cancelled) return
        setProducts(data?.results?.[0]?.hits ?? [])
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (products !== null && products.length === 0) return null

  return (
    <div className="mt-5 pt-4 border-t border-theme-border dark:border-neutral-800">
      <p className="text-xs font-bold uppercase tracking-wide text-theme-muted dark:text-gray-500 mb-2.5">
        Frequently Bought With Containers
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
        {products === null
          ? Array.from({ length: 4 }).map((_, i) => <AccessoryCardSkeleton key={`accessory-skeleton-${i}`} />)
          : products.map((p, i) => (
              <Link
                key={`accessory-upsell-${p.objectID}-${i}`}
                href={`/product/${p.handle}`}
                onClick={onNavigate}
                className="snap-start shrink-0 w-32 group"
              >
                <div className="w-32 h-32 rounded-lg bg-theme-subtle dark:bg-neutral-800 border border-theme-border dark:border-neutral-700 overflow-hidden">
                  {p.images?.[0]?.src ? (
                    <Image
                      src={p.images[0].src}
                      alt={p.title}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                    />
                  ) : null}
                </div>
                <p className="mt-2 text-xs font-semibold text-theme-dark dark:text-white line-clamp-2 group-hover:text-theme-primary transition-colors">
                  {p.title}
                </p>
                <p className="text-xs text-theme-muted">{fmt(p.sale_price)}</p>
              </Link>
            ))}
      </div>
    </div>
  )
}

export function AddedToCartModal({ item, onClose }: Props) {
  const isContainer = !!item?.isContainer

  return (
    <Modal
      open={item !== null}
      onClose={onClose}
      title="Added to Cart!"
      maxWidth={isContainer ? 'max-w-xl' : 'max-w-md'}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border-2 border-theme-border px-4 py-2.5 text-sm font-bold text-theme-dark dark:text-white dark:border-neutral-700 hover:border-theme-primary hover:text-theme-primary transition-colors"
          >
            Continue Shopping
          </button>
          <Link
            href="/cart"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-theme-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-theme-primary-dark transition-colors"
          >
            <ShoppingCart className="w-4 h-4" /> View Cart
          </Link>
        </>
      }
    >
      {item && (
        <div>
          <div className="flex items-center gap-3.5">
            <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            {item.image && (
              <div className="shrink-0 w-14 h-14 rounded-lg bg-theme-subtle dark:bg-white/5 border border-theme-border dark:border-neutral-800 overflow-hidden">
                <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-theme-dark dark:text-white truncate">{item.name}</p>
              <p className="text-xs text-theme-muted">Qty {item.quantity} · {fmt(item.price)}</p>
            </div>
          </div>

          {isContainer && (
            <>
              <div className="mt-3.5">
                <SpecChips item={item} />
              </div>
              <FrequentlyBought onNavigate={onClose} />
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
