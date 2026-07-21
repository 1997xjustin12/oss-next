'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, ShoppingCart, MapPin } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { CartLocationConflictModal } from '@/components/cart/CartLocationConflictModal'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { Stars } from '@/components/product/Stars'
import { useAddContainerToCart } from '@/hooks/useAddContainerToCart'
import { CONTACT_NUMBER } from '@/lib/helpers'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { normaliseRating } from '@/lib/ratings'
import { ROUTES } from '@/config/routes'
import type { HitData } from './InstantSearchSection'

type Props = {
  open:  boolean
  onClose: () => void
  hit:   HitData
}

// Migrated ACF custom_fields occasionally carry a leading zero-width space
// from the WordPress export — strip it along with normal whitespace.
function getCF(hit: HitData, name: string): string {
  const raw = hit.custom_fields?.find((f) => f.name === name)?.value ?? ''
  return raw.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
}

export function QuickViewModal({ open, onClose, hit }: Props) {
  const [added, setAdded] = useState(false)
  const { conflict, clearConflict, addContainerToCart, clearCart } = useAddContainerToCart()

  const images     = hit.images?.length ? hit.images.map((img) => img.src) : []
  const sku        = hit.variants?.[0]?.sku ?? ''
  const { value: rating } = normaliseRating(hit.ratings)
  const price      = hit.sale_price ?? 0
  const paymentType = getCF(hit, 'payment_type')
  const priceSuffix = paymentType === 'rental' || paymentType === 'rto' ? '/mo' : ''

  // "Various North America" is a generic-display placeholder, not a real
  // depot — never show it, and don't let it be added to the cart as if it
  // were a purchasable location.
  const location = getCF(hit, 'location')
  const isGenericLocation = location === DEFAULT_LOCATION

  const specs = [
    { label: 'Location',         value: isGenericLocation ? '' : location },
    { label: 'Size',              value: getCF(hit, 'length_width') },
    { label: 'Height',            value: getCF(hit, 'height') },
    { label: 'Grade',             value: getCF(hit, 'grade') },
    { label: 'Condition',         value: getCF(hit, 'condition') },
    { label: 'Door Type',         value: getCF(hit, 'doortype') },
    { label: 'Selection Option',  value: getCF(hit, 'selectionoptions') },
  ].filter((s) => s.value)

  function handleAddToCart() {
    if (isGenericLocation) return
    const wasAdded = addContainerToCart({
      id:          hit.objectID,
      name:        hit.title,
      price,
      quantity:    1,
      sku,
      size:        getCF(hit, 'length_width'),
      condition:   getCF(hit, 'condition'),
      orderType:   paymentType === 'rental' ? 'Rental' : paymentType === 'rto' ? 'Rent-to-Own' : 'Purchase',
      image:       images[0],
      isContainer: true,
      location,
      rawHit:      hit,
    })
    if (!wasAdded) return

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <Modal open={open} onClose={onClose} bare maxWidth="max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-7">
          {/* Gallery */}
          <div className="w-full">
            <ProductImageGallery images={images} title={hit.title} />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3">
            {sku && (
              <p className="text-xs font-semibold text-theme-muted">SKU: {sku}</p>
            )}

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight text-theme-dark dark:text-white">
              {hit.title}
            </h2>

            {rating > 0 && (
              <div className="flex items-center gap-2">
                <Stars count={Math.round(rating)} className="w-4 h-4" />
                <span className="text-sm font-semibold text-theme-mid dark:text-gray-300">{rating.toFixed(1)}</span>
              </div>
            )}

            <p className="text-3xl font-extrabold tracking-tight text-theme-dark dark:text-white">
              {isGenericLocation && <span className="text-lg font-bold text-theme-muted mr-1.5">Starts at</span>}
              ${price.toLocaleString('en-US')}{priceSuffix}
            </p>

            <p className="flex items-center gap-1.5 text-sm font-semibold text-theme-accent">
              <Phone className="w-3.5 h-3.5" />
              Found It Cheaper?{' '}
              <a href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`} className="hover:underline">
                {CONTACT_NUMBER}
              </a>
            </p>

            {specs.length > 0 && (
              <ul className="flex flex-col gap-1.5 mt-1 text-sm">
                {specs.map((s) => (
                  <li key={s.label} className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-theme-primary shrink-0" />
                    {s.label === 'Location' ? (
                      <span className="flex items-center gap-1 text-theme-mid dark:text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-theme-muted shrink-0" />
                        <span className="font-semibold text-theme-dark dark:text-white">{s.label}:</span> {s.value}
                      </span>
                    ) : (
                      <span className="text-theme-mid dark:text-gray-300">
                        <span className="font-semibold text-theme-dark dark:text-white">{s.label}:</span> {s.value}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 mt-3">
              <Link
                href={ROUTES.PRODUCT(hit.handle)}
                onClick={onClose}
                className="flex-1 text-center rounded-md border-2 border-theme-primary text-theme-primary font-bold px-4 py-2.5 text-sm hover:bg-theme-primary-light transition-colors"
              >
                View Item
              </Link>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isGenericLocation}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-theme-primary text-white font-bold px-4 py-2.5 text-sm hover:bg-theme-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-theme-primary"
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
            {isGenericLocation && (
              <p className="text-xs text-theme-muted -mt-1">
                Call <a href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, '')}`} className="text-theme-primary hover:underline">{CONTACT_NUMBER}</a> to check availability near you.
              </p>
            )}
          </div>
        </div>
      </Modal>

      {conflict && (
        <CartLocationConflictModal
          open={true}
          onClose={clearConflict}
          currentLocation={conflict.currentLocation}
          newLocation={conflict.newLocation}
          onClearCart={clearCart}
        />
      )}
    </>
  )
}
