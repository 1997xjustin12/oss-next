'use client'

import { useEffect, useState } from 'react'
import { PlpLink } from '@/components/shared/PlpLink'
import { PackageSearch, RotateCcw, Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useAddContainerToCart } from '@/hooks/useAddContainerToCart'
import { getCustomFieldValue, isContainerHit } from '@/lib/pricing'
import { ROUTES } from '@/config/routes'
import { OrderCard } from '@/components/order/OrderCard'
import { ReviewFormModal } from './ReviewFormModal'
import type { GuestOrder, GuestOrderItem, Order, OrderStatus } from '@/types/order'
import type { ProductHit } from '@/types/product'
import type { Review } from '@/types/review'

// Per docs/reference/REVIEWS_FLOW.md: the reference app only gates "write a review" on a
// delivered order in the Order History flow (its standalone PDP form has no
// purchase check at all) — so this is the sole review entry point, not the PDP.
const REVIEWABLE: OrderStatus[] = ['delivered']

const REORDERABLE: OrderStatus[] = ['delivered', 'cancelled', 'refunded']

const ACTION =
  'flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors disabled:opacity-50 dark:text-red-400'

/**
 * Newest first when the backend dates its orders; otherwise its own order is
 * kept, since there is nothing better to sort by.
 */
function newestFirst(orders: Order[]): Order[] {
  const dated = (o: Order) => Date.parse((o as { created_at?: string }).created_at ?? '')
  if (!orders.every((o) => Number.isFinite(dated(o)))) return orders
  return [...orders].sort((a, b) => dated(b) - dated(a))
}

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[0, 1].map((i) => (
        <div key={`order-skeleton-${i}`} className="rounded-lg border border-theme-border bg-theme-subtle dark:border-gray-700 dark:bg-gray-800 p-4 sm:p-5">
          <div className="h-4 w-32 rounded bg-theme-border dark:bg-gray-700 mb-4" />
          <div className="h-12 w-full rounded bg-theme-border dark:bg-gray-700 mb-2" />
          <div className="h-12 w-full rounded bg-theme-border dark:bg-gray-700" />
        </div>
      ))}
    </div>
  )
}

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-theme-border bg-theme-subtle px-6 py-12 text-center
                     dark:border-gray-700 dark:bg-gray-800">
      <PackageSearch className="h-8 w-8 text-theme-muted dark:text-gray-500" />
      <p className="text-sm text-theme-muted dark:text-gray-400">No order has been made yet.</p>
      <PlpLink
        href={ROUTES.PLP}
        className="mt-2 rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-5 py-2.5 text-sm transition-colors"
      >
        Browse Containers
      </PlpLink>
    </div>
  )
}

export function OrdersList() {
  const { token, user } = useAuth()
  const { addItem } = useCart()

  const { addContainerToCart } = useAddContainerToCart()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [products, setProducts] = useState<Record<string, ProductHit>>({})
  // Whether the catalogue lookup for the ordered products has finished. Only a
  // finished lookup can say a product is no longer available; a pending or
  // failed one says nothing.
  const [productLookup, setProductLookup] = useState<'loading' | 'done' | 'failed'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [reviewLoadingFor, setReviewLoadingFor] = useState<string | number | null>(null)
  const [reviewTarget, setReviewTarget] = useState<{
    productId: string | number
    productTitle: string
    existingReview: Review | null
  } | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelled = false

    fetch('/api/auth/orders', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Could not load orders.'))))
      .then(async (data: { orders?: Order[] } | Order[]) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : (data.orders ?? [])
        setOrders(list)

        const ids = [...new Set(list.flatMap((o) => o.items.map((i) => String(i.product_id))))]
        if (ids.length === 0) {
          setProductLookup('done')
          return
        }

        const enrichRes = await fetch(`/api/products/by-ids?ids=${ids.join(',')}`)
        if (cancelled) return
        if (!enrichRes.ok) {
          setProductLookup('failed')
          return
        }
        const { products: found } = (await enrichRes.json()) as { products: ProductHit[] }
        if (cancelled) return
        setProducts(Object.fromEntries(found.map((p) => [String(p.product_id), p])))
        setProductLookup('done')
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load orders.')
      })

    return () => { cancelled = true }
  }, [token])

  function handleBuyAgain(productId: string | number) {
    const product = products[String(productId)]
    if (!product) return

    const base = {
      id: product.objectID,
      name: product.title,
      price: product.sale_price,
      // Always one, whatever the original order held (decided 2026-09-15): the
      // customer sets the quantity in the cart.
      quantity: 1,
      sku: product.variants?.[0]?.sku,
      image: product.images?.[0]?.src,
      rawHit: product,
    }

    // A shipping container goes through the same path as the product page, so
    // the one-depot-per-order rule applies. Re-adding one with plain addItem
    // left it unmarked — neither `isContainer` nor `location` — so the cart
    // treated it like an accessory: it was never blocked against the cart's
    // depot, and once in the cart it could not block a ZIP change either.
    // Accessories have no location constraint and keep the plain add.
    if (isContainerHit(product)) {
      addContainerToCart({
        ...base,
        size: getCustomFieldValue(product, 'length_width'),
        condition: getCustomFieldValue(product, 'condition'),
        isContainer: true,
        location: getCustomFieldValue(product, 'location'),
      })
      return
    }
    addItem(base)
  }

  // Checks for an existing review by this user on this product first (per
  // docs/reference/REVIEWS_FLOW.md's duplicate-detection pattern: GET the product's reviews,
  // match by email) so the modal opens pre-filled for edit instead of create.
  async function openReviewForm(productId: string | number, productTitle: string) {
    setReviewLoadingFor(productId)
    try {
      const res = await fetch(`/api/reviews/list?product_id=${productId}`)
      const data = await res.json().catch(() => null)
      const results: Review[] = Array.isArray(data?.results) ? data.results : []
      const existing = results.find((r) => !!user?.email && r.user?.email === user.email) ?? null
      setReviewTarget({ productId, productTitle, existingReview: existing })
    } catch {
      setReviewTarget({ productId, productTitle, existingReview: null })
    } finally {
      setReviewLoadingFor(null)
    }
  }

  if (error) {
    return (
      <div className="rounded-md border border-theme-primary/30 bg-theme-primary-light px-4 py-3 text-sm text-theme-primary
                       dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (orders === null) return <OrdersSkeleton />
  if (orders.length === 0) return <EmptyOrders />

  // Held until the catalogue lookup settles, so a line never flashes "No longer
  // available" on its way to its real name.
  if (productLookup === 'loading') return <OrdersSkeleton />

  /**
   * Only what the backend sends — number, status, total and items — joined
   * with each item's catalogue product for its name, picture and link. The
   * card leaves out every section it has no data for.
   */
  const display: GuestOrder[] = newestFirst(orders).map((order) => ({
    ...order,
    items: order.items.map((item) => {
      const product = products[String(item.product_id)]
      if (product) return { ...item, title: product.title, image: product.images?.[0]?.src, handle: product.handle }
      // A failed lookup says nothing about whether the product still exists,
      // so the line is named by its id rather than called unavailable.
      return productLookup === 'failed' ? { ...item, title: `Item #${item.product_id}` } : item
    }),
  }))

  function actionsFor(order: GuestOrder) {
    const canReorder = REORDERABLE.includes(order.status)
    const canReview = REVIEWABLE.includes(order.status)
    if (!canReorder && !canReview) return undefined

    return function ItemActions(item: GuestOrderItem) {
      const product = products[String(item.product_id)]
      if (!product) return null
      return (
        <>
          {canReorder && (
            <button
              type="button"
              aria-label={`Buy Again: ${product.title}`}
              onClick={() => handleBuyAgain(item.product_id)}
              className={ACTION}
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Buy Again
            </button>
          )}
          {canReview && (
            <button
              type="button"
              aria-label={`Write / Edit Review: ${product.title}`}
              disabled={reviewLoadingFor === item.product_id}
              onClick={() => openReviewForm(item.product_id, product.title)}
              className={ACTION}
            >
              <Star className="w-3.5 h-3.5" aria-hidden="true" />
              {reviewLoadingFor === item.product_id ? 'Loading…' : 'Write / Edit Review'}
            </button>
          )}
        </>
      )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Only the newest starts open; the rest fold to their header and total. */}
      {display.map((order, orderIndex) => (
        <OrderCard
          key={`orders-list-${order.order_number}-${orderIndex}`}
          order={order}
          collapsible
          defaultOpen={orderIndex === 0}
          itemActions={actionsFor(order)}
        />
      ))}

      {reviewTarget && (
        <ReviewFormModal
          open
          onClose={() => setReviewTarget(null)}
          productId={reviewTarget.productId}
          productTitle={reviewTarget.productTitle}
          existingReview={reviewTarget.existingReview}
          onSaved={() => setReviewTarget(null)}
        />
      )}
    </div>
  )
}
