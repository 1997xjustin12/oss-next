'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { getCustomFieldValue } from '@/lib/pricing'
import { DEFAULT_LOCATION } from '@/lib/constants'
import { ROUTES } from '@/config/routes'
import type { CartItem } from '@/types/cart'
import type { ProductHit } from '@/types/product'
import { formatMoney } from '@/lib/formatters'

type Props = {
  item:    CartItem | null
  onClose: () => void
  /**
   * Put an upsell accessory in the cart.
   *
   * Passed in rather than taken from `useCart()`, because CartProvider renders
   * this dialog itself: importing the hook here would close the loop
   * AddedToCartModal → useCart → CartContext → AddedToCartModal, and a module
   * cycle through the provider leaves the context half-initialised at hydration
   * — which showed up as the product page behaving as though it had never been
   * given a ZIP. The provider already holds `addItem`, so it hands it down.
   */
  onAddAccessory: (item: CartItem) => void
}

/**
 * Four specs of the container just added, as a 2x2 grid of labelled tiles.
 *
 * Reads the same `custom_fields` keys the PDP does. Size is the two dimension
 * fields joined, because they are one fact to a buyer and two rows in the
 * index. A tile with nothing behind it is dropped rather than shown empty, so a
 * product missing a door type gets three tiles instead of a blank box.
 */
function SpecGrid({ item }: { item: CartItem }) {
  const hit = item.rawHit
  const field = (name: string) => (hit ? getCustomFieldValue(hit, name) : '')

  // `length_width` ahead of `item.size`: the cart's copy carries the height
  // class too ("40' Standard"), which lands next to the height field and prints
  // Standard twice. The index field is the bare dimension.
  const size = [field('length_width') || item.size, field('height')].filter(Boolean).join(', ')

  const specs = [
    { label: 'Condition', value: item.condition ?? field('condition') },
    { label: 'Size', value: size },
    { label: 'Grade', value: field('grade') },
    { label: 'Door Type', value: field('doortype') },
  ].filter((s) => s.value)

  if (specs.length === 0) return null

  return (
    <dl className="mt-4 grid grid-cols-2 gap-2.5">
      {specs.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border border-theme-border bg-theme-subtle px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-theme-muted dark:text-gray-500">
            {s.label}
          </dt>
          <dd className="mt-0.5 text-sm font-bold text-theme-dark dark:text-white">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function AccessoryCardSkeleton() {
  return (
    <div className="w-44 shrink-0 animate-pulse rounded-lg border border-theme-border p-3 dark:border-neutral-700">
      <div className="h-24 rounded bg-theme-subtle dark:bg-neutral-800" />
      <div className="mx-auto mt-3 h-2.5 w-3/4 rounded bg-theme-subtle dark:bg-neutral-800" />
      <div className="mx-auto mt-2 h-2.5 w-1/3 rounded bg-theme-subtle dark:bg-neutral-800" />
      <div className="mt-3 h-9 rounded-md bg-theme-subtle dark:bg-neutral-800" />
    </div>
  )
}

/**
 * One upsell card: the accessory, its price, and a button that puts it in the
 * cart without leaving this dialog.
 *
 * The add is silent, so it does not replace the container this dialog is
 * confirming with a second dialog about a padlock. The button reports the
 * result where it was pressed instead.
 */
function AccessoryCard({
  product,
  onAdd,
  onNavigate,
}: {
  product: ProductHit
  onAdd: (item: CartItem) => void
  onNavigate: () => void
}) {
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const timer = setTimeout(() => setAdded(false), 2000)
    return () => clearTimeout(timer)
  }, [added])

  function handleAdd() {
    onAdd({
      id: product.objectID,
      name: product.title,
      price: product.sale_price,
      quantity: 1,
      orderType: 'Purchase',
      image: product.images?.[0]?.src,
      rawHit: product,
    })
    setAdded(true)
  }

  return (
    <div className="flex w-44 shrink-0 snap-start flex-col rounded-lg border border-theme-border p-3 dark:border-neutral-700">
      <Link href={ROUTES.PRODUCT(product.handle)} onClick={onNavigate} className="group flex flex-1 flex-col">
        <div className="flex h-24 items-center justify-center overflow-hidden">
          {product.images?.[0]?.src ? (
            <Image
              src={product.images[0].src}
              alt={product.title}
              width={96}
              height={96}
              className="h-24 w-auto object-contain transition-transform group-hover:scale-105"
            />
          ) : null}
        </div>
        <p className="mt-2.5 line-clamp-2 text-center text-xs font-semibold text-theme-dark transition-colors group-hover:text-theme-primary dark:text-white">
          {product.title}
        </p>
        <p className="mt-1.5 text-center text-sm font-bold text-theme-dark dark:text-white">
          {formatMoney(product.sale_price)}
        </p>
      </Link>
      <button
        type="button"
        disabled={added}
        onClick={handleAdd}
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-theme-primary text-xs font-bold text-white transition-colors hover:bg-theme-primary-dark disabled:cursor-default disabled:hover:bg-theme-primary"
      >
        {added ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden />
            Added
          </>
        ) : (
          'Add To Cart'
        )}
      </button>
    </div>
  )
}

// Generic accessory upsell row — reuses the same ES-backed /api/search route
// the PLP's instant search calls, filtered to productType: 'accessories' (any
// category that isn't Shipping Containers/Generic Product Page). No pairing
// logic with the item just added — just a basic accessory sampler, per spec.
function FrequentlyBought({
  onAdd,
  onNavigate,
}: {
  onAdd: (item: CartItem) => void
  onNavigate: () => void
}) {
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
    <section className="mt-6">
      <h3 className="mb-3 text-sm font-bold text-theme-dark dark:text-white">Frequently Bought Together</h3>
      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
        {products === null
          ? Array.from({ length: 4 }).map((_, i) => <AccessoryCardSkeleton key={`accessory-skeleton-${i}`} />)
          : products.map((p, i) => (
              <AccessoryCard
                key={`accessory-upsell-${p.objectID}-${i}`}
                product={p}
                onAdd={onAdd}
                onNavigate={onNavigate}
              />
            ))}
      </div>
    </section>
  )
}

export function AddedToCartModal({ item, onClose, onAddAccessory }: Props) {
  const isContainer = !!item?.isContainer
  const hit = item?.rawHit
  // "Various North America" is a generic-display placeholder, not a real depot.
  const location = item?.location ?? (hit ? getCustomFieldValue(hit, 'location') : '')
  const depot = location && location !== DEFAULT_LOCATION ? location : ''

  return (
    <Modal
      open={item !== null}
      onClose={onClose}
      title="Added To Cart"
      bare
      hideCloseButton
      maxWidth={isContainer ? 'max-w-lg' : 'max-w-md'}
    >
      {item && (
        <>
          {/* The confirmation and the money it cost, together on the band: the
              two things a buyer checks before deciding whether to carry on. */}
          <header className="flex items-center justify-between gap-4 bg-theme-primary px-5 py-4 sm:px-6">
            <p className="flex items-center gap-2 text-lg font-bold text-white">
              <Check className="h-5 w-5 shrink-0" aria-hidden />
              Added To Cart
            </p>
            <div className="flex items-center gap-3">
              <p className="text-lg font-bold text-white">{formatMoney(item.price * item.quantity)}</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1.5 shrink-0 rounded-md p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </header>

          <div className="px-5 py-5 sm:px-6">
            <div className="flex items-center gap-4">
              {item.image && (
                <div className="h-[72px] w-24 shrink-0 overflow-hidden rounded-lg bg-theme-subtle dark:bg-white/5">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={72}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0">
                {/* Clamped, not shortened. Some catalogue titles are two names
                    joined by "||" and run to three lines here; the cart page
                    shows the same string, so trimming it only in this dialog
                    would have the confirmation disagree with what it confirms. */}
                <p className="line-clamp-2 font-bold leading-snug text-theme-dark dark:text-white">{item.name}</p>
                {/* Where it ships from if we know, and how many if it is not
                    the one everybody adds. A line reading "Qty 1" is noise. */}
                <p className="mt-0.5 text-xs text-theme-muted">
                  {[depot, item.quantity > 1 ? `Qty ${item.quantity}` : ''].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>

            {isContainer && (
              <>
                <SpecGrid item={item} />
                <FrequentlyBought onAdd={onAddAccessory} onNavigate={onClose} />
              </>
            )}

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href={ROUTES.CART}
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border-2 border-theme-border px-4 py-2.5 text-sm font-bold text-theme-dark transition-colors hover:border-theme-primary hover:text-theme-primary dark:border-neutral-700 dark:text-white"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Go To Cart
              </Link>
              {/* Primary, because the cart is already safe and the next thing
                  that helps this visitor is another container. */}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-md bg-theme-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}
