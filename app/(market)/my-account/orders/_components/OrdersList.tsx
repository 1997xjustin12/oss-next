'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PackageSearch, Package, RotateCcw, Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { ROUTES } from '@/config/routes'
import { ReviewFormModal } from './ReviewFormModal'
import type { Order, OrderStatus } from '@/types/order'
import type { ProductHit } from '@/types/product'
import type { Review } from '@/types/review'

// Per docs/reference/REVIEWS_FLOW.md: the reference app only gates "write a review" on a
// delivered order in the Order History flow (its standalone PDP form has no
// purchase check at all) — so this is the sole review entry point, not the PDP.
const REVIEWABLE: OrderStatus[] = ['delivered']

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50' },
  paid:      { label: 'Paid',      className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50' },
  shipped:   { label: 'Shipped',   className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/50' },
  delivered: { label: 'Delivered', className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/50' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' },
  refunded:  { label: 'Refunded',  className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50' },
}

const REORDERABLE: OrderStatus[] = ['delivered', 'cancelled', 'refunded']

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 border-gray-300' }
  return (
    <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${config.className}`}>
      {config.label}
    </span>
  )
}

function fmtMoney(n: string | number): string {
  const num = typeof n === 'string' ? parseFloat(n) : n
  return Number.isFinite(num) ? num.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '—'
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
      <Link
        href={ROUTES.PLP}
        className="mt-2 rounded-md bg-theme-primary hover:bg-theme-primary-dark text-white font-semibold px-5 py-2.5 text-sm transition-colors"
      >
        Browse Containers
      </Link>
    </div>
  )
}

export function OrdersList() {
  const { token, user } = useAuth()
  const { addItem } = useCart()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [products, setProducts] = useState<Record<string, ProductHit>>({})
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
        if (ids.length === 0) return

        const enrichRes = await fetch(`/api/products/by-ids?ids=${ids.join(',')}`)
        if (!enrichRes.ok || cancelled) return
        const { products: found } = (await enrichRes.json()) as { products: ProductHit[] }
        setProducts(Object.fromEntries(found.map((p) => [String(p.product_id), p])))
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load orders.')
      })

    return () => { cancelled = true }
  }, [token])

  function handleBuyAgain(productId: string | number, quantity: number) {
    const product = products[String(productId)]
    if (!product) return
    addItem({
      id: product.objectID,
      name: product.title,
      price: product.sale_price,
      quantity,
      sku: product.variants?.[0]?.sku,
      image: product.images?.[0]?.src,
      rawHit: product,
    })
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

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order, orderIndex) => (
        <div
          key={`orders-list-${order.order_number}-${orderIndex}`}
          className="rounded-lg border border-theme-border bg-white dark:border-gray-700 dark:bg-gray-900 p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3 pb-3 border-b border-theme-border dark:border-gray-700">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-theme-muted dark:text-gray-400">Order</p>
              <p className="text-base font-extrabold text-theme-dark dark:text-white">#{order.order_number}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="flex flex-col gap-3 mb-3">
            {order.items.map((item, itemIndex) => {
              const product = products[String(item.product_id)]
              return (
                <div key={`order-item-${order.order_number}-${item.product_id}-${itemIndex}`} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md bg-theme-subtle dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {product?.images?.[0]?.src ? (
                      <Image src={product.images[0].src} alt={product.title} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <Package className="w-5 h-5 text-theme-muted dark:text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {product?.handle ? (
                      <Link href={ROUTES.PRODUCT(product.handle)} className="text-sm font-semibold truncate hover:text-theme-primary dark:text-white block">
                        {product.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold truncate dark:text-white">Item #{item.product_id}</p>
                    )}
                    <p className="text-xs text-theme-muted dark:text-gray-400">
                      Qty {item.quantity} · {fmtMoney(item.price)} each
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-theme-border dark:border-gray-700">
            <span className="text-sm font-semibold text-theme-muted dark:text-gray-400">Total</span>
            <span className="text-lg font-extrabold dark:text-white">{fmtMoney(order.total_price)}</span>
          </div>

          {(REORDERABLE.includes(order.status) || REVIEWABLE.includes(order.status)) && (
            <div className="flex gap-4 flex-wrap mt-3 pt-3 border-t border-theme-border dark:border-gray-700">
              {order.items.map((item, itemIndex) => {
                const product = products[String(item.product_id)]
                if (!product) return null
                return (
                  <div key={`item-actions-${order.order_number}-${item.product_id}-${itemIndex}`} className="flex items-center gap-4">
                    {REORDERABLE.includes(order.status) && (
                      <button
                        type="button"
                        onClick={() => handleBuyAgain(item.product_id, item.quantity)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Buy Again
                      </button>
                    )}
                    {REVIEWABLE.includes(order.status) && (
                      <button
                        type="button"
                        disabled={reviewLoadingFor === item.product_id}
                        onClick={() => openReviewForm(item.product_id, product.title)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-theme-primary hover:text-theme-primary-dark transition-colors disabled:opacity-50"
                      >
                        <Star className="w-3.5 h-3.5" />
                        {reviewLoadingFor === item.product_id ? 'Loading…' : 'Write / Edit Review'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
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
