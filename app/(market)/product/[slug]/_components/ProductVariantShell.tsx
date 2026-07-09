'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getCustomFieldValue, isContainerHit } from '@/lib/pricing'
import type { ProductHit } from '@/types/product'
import { ProductImageGallery } from './ProductImageGallery'
import { ProductInfoPanel } from './ProductInfoPanel'
import { BASE_URL } from '@/lib/helpers'

const base = BASE_URL.replace(/\/$/, '')

function getListingCrumb(product: ProductHit) {
  if (!isContainerHit(product)) {
    return { label: 'Shipping Containers Accessories For Sale', href: `${base}/sale-shipping-containers/?ptype=accesories` }
  }
  const paymentType = getCustomFieldValue(product, 'payment_type')
  if (paymentType === 'rental') return { label: 'Shipping Containers For Rent',        href: `${base}/sale-shipping-containers/?ptype=rental` }
  if (paymentType === 'rto')    return { label: 'Shipping Containers For Rent-To-Own', href: `${base}/sale-shipping-containers/?ptype=rto` }
  return                              { label: 'Shipping Containers For Sale',         href: `${base}/sale-shipping-containers/?ptype=buy` }
}

function deriveQuickSpecs(product: ProductHit) {
  const sizeNum = getCustomFieldValue(product, 'length_width').match(/\d+/)?.[0] ?? '—'
  return [
    { label: 'Length', value: sizeNum !== '—' ? `${sizeNum} ft` : '—' },
    { label: 'Width',  value: '8 ft' },
    { label: 'Height', value: getCustomFieldValue(product, 'height') || '8\'6"' },
    { label: 'Cu Ft',  value: '1,170', accent: true },
    { label: 'Sq Ft',  value: '160',   accent: true },
    { label: 'Lbs Tare', value: '4,850', accent: true },
  ]
}

type Props = { product: ProductHit; relatedProducts: ProductHit[] }

export function ProductVariantShell({ product, relatedProducts }: Props) {
  const [activeProduct, setActiveProduct] = useState(product)

  // Update URL without triggering navigation when variant changes
  useEffect(() => {
    if (activeProduct === product) return
    if (!activeProduct.handle) return
    window.history.pushState({}, '', `/product/${activeProduct.handle}`)
  }, [activeProduct, product])

  const crumb      = getListingCrumb(activeProduct)
  const allImages  = (activeProduct.images ?? []).map((img) => img.src).filter(Boolean)
  const quickSpecs = deriveQuickSpecs(activeProduct)
  const promoTag   = activeProduct.tags?.find((t) => !/stock/i.test(t))

  return (
    <>
      {/* BREADCRUMB */}
      <div className="flex items-center gap-1.5 flex-wrap px-4 sm:px-[5%] py-3 text-xs sm:text-sm text-theme-muted bg-theme-subtle border-b border-theme-border">
        <Link href="/" className="hover:text-theme-primary transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        <Link href={crumb.href} className="hover:text-theme-primary transition-colors">{crumb.label}</Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        <span className="text-theme-dark font-semibold">
          {activeProduct.title}
        </span>
      </div>

      {/* PRODUCT GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-10 px-4 sm:px-[5%] py-8 sm:py-10">
        {/* Gallery + quick specs */}
        <div className="lg:sticky lg:top-6 self-start w-full">
          <ProductImageGallery
            images={allImages}
            title={activeProduct.title}
            tag={promoTag}
          />
          <div className="grid grid-cols-3 gap-3 mt-5 bg-theme-dark rounded-lg p-4 sm:p-5 text-center">
            {quickSpecs.map((s) => (
              <div key={s.label}>
                <div className={`text-lg sm:text-2xl font-extrabold tracking-tight ${s.accent ? 'text-theme-primary' : 'text-white'}`}>
                  {s.value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-white/45 uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Product info */}
        <ProductInfoPanel
          product={activeProduct}
          relatedProducts={relatedProducts}
          categoryLabel={crumb.label}
          onVariantChange={setActiveProduct}
        />
      </section>
    </>
  )
}
