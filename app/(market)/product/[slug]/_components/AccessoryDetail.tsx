'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Phone, MapPin, Tag, CheckCircle2, XCircle, Star, ChevronRight } from 'lucide-react'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { useCart } from '@/hooks/useCart'
import { getCustomFieldValue, isInStockHit } from '@/lib/pricing'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { CONTACT_NUMBER } from '@/lib/helpers'
import { normaliseRating } from '@/lib/ratings'
import { ROUTES } from '@/config/routes'
import type { ProductHit } from '@/types/product'

type Props = { product: ProductHit }

function formatPrice(price: number): string {
  if (!price || price <= 0) return 'Call for Price'
  return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const CONTAINER_CATEGORY_NAMES = ['Shipping Containers', 'Generic Product Page']

export function AccessoryDetail({ product }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const images = product.images?.length > 0 ? product.images.map((img) => img.src) : []
  const { value: ratingNum } = normaliseRating(product.ratings)
  const sku = product.variants?.[0]?.sku ?? ''
  const condition = getCustomFieldValue(product, 'condition')
  const location = getCustomFieldValue(product, 'location')
  const visibleCategories = (product.product_category ?? [])
    .map((c) => c.category_name)
    .filter((name) => !CONTAINER_CATEGORY_NAMES.includes(name))
  const promoTag = product.tags?.find((t) => !/stock/i.test(t))
  const inStock = isInStockHit(product)

  function handleAddToCart() {
    addItem({
      id: product.objectID,
      name: product.title,
      price: product.sale_price,
      quantity: 1,
      sku,
      condition,
      orderType: 'Purchase',
      image: images[0],
      rawHit: product,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="bg-theme-bg text-theme-dark min-h-screen">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 flex-wrap px-4 sm:px-[5%] py-3 text-xs sm:text-sm text-theme-muted bg-theme-subtle border-b border-theme-border">
        <Link href={ROUTES.HOME} className="hover:text-theme-primary transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        <Link href={ROUTES.PLP_ACCESSORIES} className="hover:text-theme-primary transition-colors">Container Accessories</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        <span className="text-theme-dark font-semibold">{product.title}</span>
      </div>

      <section className="px-4 sm:px-[5%] py-8 sm:py-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

          {/* ── Gallery ── */}
          <div className="w-full">
            <ProductImageGallery images={images} title={product.title} tag={promoTag} inStock={inStock} />
          </div>

          {/* ── Info Panel ── */}
          <div className="flex flex-col gap-5">

            {/* Category chips */}
            {visibleCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {visibleCategories.map(c => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide bg-theme-subtle dark:bg-white/5 text-theme-mid border border-theme-border px-2.5 py-1 rounded"
                  >
                    <Tag className="w-3 h-3" />
                    {c}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight dark:text-white">
              {product.title}
            </h1>

            {/* Star rating */}
            {ratingNum > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star
                      key={n}
                      className={`w-4 h-4 ${n <= Math.round(ratingNum) ? 'fill-amber-400 text-amber-400' : 'text-theme-border'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-theme-mid">{ratingNum.toFixed(1)}</span>
              </div>
            )}

            {/* Stock · SKU · Location */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded bg-theme-subtle text-theme-muted dark:bg-white/5">
                  <XCircle className="w-3.5 h-3.5" />
                  Out of Stock
                </span>
              )}
              {sku && (
                <span className="text-theme-muted">
                  SKU: <span className="font-mono font-semibold text-theme-mid">{sku}</span>
                </span>
              )}
              {location && location !== DEFAULT_LOCATION && (
                <span className="flex items-center gap-1 text-theme-muted">
                  <MapPin className="w-3.5 h-3.5" />
                  {location}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="py-5 border-t border-b border-theme-border">
              <p className="text-4xl sm:text-5xl font-extrabold tracking-tight dark:text-white">
                {formatPrice(product.sale_price)}
              </p>
              {product.sale_price > 0 && (
                <p className="text-sm text-theme-muted mt-1.5">
                  Per unit &middot; Shipping &amp; taxes calculated at checkout
                </p>
              )}
            </div>

            {/* Condition detail */}
            {condition && (
              <div className="bg-theme-subtle dark:bg-white/5 border border-theme-border rounded-lg px-4 py-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-theme-muted mb-0.5">Condition</p>
                <p className="text-sm font-semibold dark:text-white">{condition}</p>
              </div>
            )}

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2.5 bg-theme-primary hover:bg-theme-primary-dark text-white font-bold text-base px-6 py-3.5 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5 shrink-0" />
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
              <a
                href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`}
                className="flex items-center justify-center gap-2 bg-theme-subtle dark:bg-white/5 hover:bg-theme-border dark:hover:bg-white/10 text-theme-dark dark:text-white font-bold px-5 py-3.5 rounded-lg border border-theme-border transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
