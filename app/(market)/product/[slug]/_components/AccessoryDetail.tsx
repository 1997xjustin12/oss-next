'use client'

import { useState } from 'react'
import { ShoppingCart, Phone, MapPin, Tag, CheckCircle2, Star } from 'lucide-react'
import { ProductImageGallery } from './ProductImageGallery'
import { useCart } from '@/hooks/useCart'
import type { WpApiProduct } from '@/types/product'

type Props = { product: WpApiProduct }

function formatPrice(raw: string): string {
  const n = parseFloat(raw)
  if (!n || n <= 0) return 'Call for Price'
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const SLUG_LABEL: Record<string, string> = {
  accesories: 'Accessories',
}

function categoryLabel(slug: string): string {
  if (slug in SLUG_LABEL) return SLUG_LABEL[slug]
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function AccessoryDetail({ product }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const images = product.gallery?.length > 0 ? product.gallery : [product.thumbnail_url].filter(Boolean)
  const price = parseFloat(product.sale_price || product.product_price) || 0
  const ratingNum = parseFloat(product.ratings) || 0
  const visibleCategories = product.categories.filter(
    c => c !== 'shipping-containers' && c !== 'generic-product-page' && c !== 'uncategorized',
  )

  function handleAddToCart() {
    addItem({
      id: String(product.productID),
      name: product.container_title,
      price,
      quantity: 1,
      sku: product.sku,
      condition: product.condition,
      orderType: 'Purchase',
      image: product.thumbnail_url,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <main className="bg-theme-bg text-theme-dark min-h-screen">
      <section className="px-4 sm:px-[5%] py-8 sm:py-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

          {/* ── Gallery ── */}
          <div className="w-full">
            <ProductImageGallery
              images={images}
              title={product.container_title}
              tag={product.tag && !/stock/i.test(product.tag) ? product.tag : undefined}
            />
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
                    {categoryLabel(c)}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight dark:text-white">
              {product.container_title}
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
                {product.review_count > 0 && (
                  <span className="text-sm text-theme-muted">({product.review_count} reviews)</span>
                )}
              </div>
            )}

            {/* Stock · SKU · Location */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Stock
              </span>
              {product.sku && (
                <span className="text-theme-muted">
                  SKU: <span className="font-mono font-semibold text-theme-mid">{product.sku}</span>
                </span>
              )}
              {product.location && (
                <span className="flex items-center gap-1 text-theme-muted">
                  <MapPin className="w-3.5 h-3.5" />
                  {product.location}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="py-5 border-t border-b border-theme-border">
              <p className="text-4xl sm:text-5xl font-extrabold tracking-tight dark:text-white">
                {formatPrice(product.sale_price || product.product_price)}
              </p>
              {price > 0 && (
                <p className="text-sm text-theme-muted mt-1.5">
                  Per unit &middot; Shipping &amp; taxes calculated at checkout
                </p>
              )}
            </div>

            {/* Condition detail */}
            {product.condition && (
              <div className="bg-theme-subtle dark:bg-white/5 border border-theme-border rounded-lg px-4 py-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-theme-muted mb-0.5">Condition</p>
                <p className="text-sm font-semibold dark:text-white">{product.condition}</p>
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
                href="tel:+18886780313"
                className="flex items-center justify-center gap-2 bg-theme-subtle dark:bg-white/5 hover:bg-theme-border dark:hover:bg-white/10 text-theme-dark dark:text-white font-bold px-5 py-3.5 rounded-lg border border-theme-border transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                Call Us
              </a>
            </div>

            {/* Description */}
            {product.short_description && (
              <div
                className="text-sm text-theme-mid dark:text-gray-400 leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-theme-dark dark:[&_strong]:text-white [&_a]:text-theme-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
