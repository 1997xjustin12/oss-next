'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Wrench, Ship, Maximize2, Snowflake } from 'lucide-react'
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

const staticRelatedProducts = [
  { Icon: Ship,     title: '40ft Standard Container',   desc: 'Double the space for larger projects and business storage.',        price: 'From $2,000',   cta: 'View' },
  { Icon: Maximize2, title: '20ft High Cube',            desc: 'Extra 1ft of height — perfect for taller inventory and work spaces.', price: 'From $1,850',  cta: 'View' },
  { Icon: Snowflake, title: '20ft Refrigerated',         desc: 'Temperature-controlled for food, pharma, and sensitive goods.',      price: 'Call for Price', cta: 'Inquire' },
  { Icon: Wrench,   title: 'Container Accessories',     desc: 'Locks, ramps, vents, shelving, lighting kits, and more.',            price: 'From $29',      cta: 'Shop' },
]

type Props = { product: ProductHit; relatedProducts: ProductHit[] }

export function ProductDetail({ product, relatedProducts }: Props) {
  // Shared across ProductVariantShell, BodyTabsSection, and FaqAccordion so
  // they all react to whichever variant the shopper currently has selected.
  const [activeProduct, setActiveProduct] = useState(product)

  if (!isContainerHit(product)) {
    return <AccessoryDetail product={product} />
  }

  const containerVariant = resolveContainerVariant(activeProduct)

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
      <section className="px-4 sm:px-[5%] py-10 sm:py-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">You May Also Need</h2>
          <Link href={ROUTES.PLP} className="text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors whitespace-nowrap">
            View All Containers →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {staticRelatedProducts.map((p) => (
            <div key={p.title} className="rounded-lg border border-theme-border bg-theme-bg overflow-hidden cursor-pointer hover:border-theme-primary hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="h-32 flex items-center justify-center bg-theme-subtle">
                <p.Icon className="w-10 h-10 text-theme-muted" strokeWidth={1.5} />
              </div>
              <div className="p-3.5">
                <h4 className="font-extrabold text-base mb-1">{p.title}</h4>
                <p className="text-xs text-theme-muted mb-3 leading-relaxed">{p.desc}</p>
                <div className="flex items-center justify-between pt-2.5 border-t border-theme-border">
                  <span className="font-extrabold text-base">{p.price}</span>
                  <button className="bg-theme-dark text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-theme-primary transition-colors">{p.cta}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
