'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { isContainerHit } from '@/lib/pricing'
import { resolveContainerVariant } from '@/lib/containerVariant'
import { ROUTES } from '@/config/routes'
import type { ProductHit } from '@/types/product'
import { ProductVariantShell } from './ProductVariantShell'
import { AccessoryDetail } from './AccessoryDetail'
import { BodyTabsSection } from './BodyTabsSection'
import { FaqAccordion } from './FaqAccordion'
// WordPress-sourced reviews (previous PDP source) — kept in place, easy to
// restore by swapping the import + JSX below, if ReviewsCarousel needs to be
// rolled back before the OSS reviews table has enough approved data.
// import { CustomerReviews } from './CustomerReviews'
import { ReviewsCarousel } from './ReviewsCarousel'

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

type Props = { product: ProductHit; relatedProducts: ProductHit[] }

export function ProductDetail({ product, relatedProducts }: Props) {
  // Shared across ProductVariantShell, BodyTabsSection, and FaqAccordion so
  // they all react to whichever variant the shopper currently has selected.
  const [activeProduct, setActiveProduct] = useState(product)

  if (!isContainerHit(product)) {
    return <AccessoryDetail product={product} />
  }

  const containerVariant = resolveContainerVariant(activeProduct)

  // Real ES-backed containers from the same location, excluding whichever
  // variant is currently on screen — was previously a hardcoded array with
  // fabricated prices and dead CTA buttons; this section is hidden entirely
  // rather than shown empty/fake when there's nothing real to display.
  const relatedToShow = relatedProducts
    .filter((p) => p.objectID !== activeProduct.objectID)
    .slice(0, 4)

  return (
    <div className="bg-theme-bg text-theme-dark">
      {/* Breadcrumb + product grid */}
      <ProductVariantShell
        product={product}
        relatedProducts={relatedProducts}
        activeProduct={activeProduct}
        onVariantChange={setActiveProduct}
      />

      {/* BODY TABS */}
      <BodyTabsSection variant={containerVariant} />

      {/* RELATED PRODUCTS */}
      {relatedToShow.length > 0 && (
        <section className="px-4 sm:px-[5%] py-10 sm:py-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">You May Also Need</h2>
            <Link href={ROUTES.PLP} className="text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors whitespace-nowrap">
              View All Containers →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedToShow.map((p) => (
              <Link
                key={p.objectID}
                href={ROUTES.PRODUCT(p.handle)}
                className="rounded-lg border border-theme-border bg-theme-bg overflow-hidden hover:border-theme-primary hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="relative h-32 bg-theme-subtle">
                  {p.images?.[0]?.src ? (
                    <Image src={p.images[0].src} alt={p.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-10 h-10 text-theme-muted" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="p-3.5">
                  <h4 className="font-extrabold text-sm mb-2 line-clamp-2 leading-snug">{p.title}</h4>
                  <div className="flex items-center justify-between pt-2.5 border-t border-theme-border">
                    <span className="font-extrabold text-base">{fmt(p.sale_price)}</span>
                    <span className="bg-theme-dark text-white text-xs font-bold px-3 py-1.5 rounded">View</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* REVIEWS */}
      <section id="reviews" className="px-4 sm:px-[5%] py-10 sm:py-16">
        {/* No "Write a Review" entry point here on purpose — review submission
            is only exposed from Order History (delivered orders), per
            REVIEWS_FLOW.md's purchase-gating recommendation. */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6">Customer Reviews</h2>
        {/* <CustomerReviews variant={containerVariant} /> */}
        <ReviewsCarousel productId={activeProduct.product_id as string | number} />
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-[5%] py-10 sm:py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <Link href="/shipping-container-faqs" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors whitespace-nowrap">View All FAQs →</Link>
        </div>
        <FaqAccordion variant={containerVariant} />
      </section>
    </div>
  )
}
