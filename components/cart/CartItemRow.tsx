'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2, Package, Lock } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import type { CartItem } from '@/types/cart'

type Props = { item: CartItem }

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export function CartItemRow({ item }: Props) {
  const { removeItem, updateQty } = useCart()
  const isAccessory = item.orderType?.toLowerCase() === 'accessory'

  return (
    <div className="rounded-xl border border-theme-border bg-white p-4 sm:p-5 hover:border-theme-primary hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Thumbnail + info */}
        <div className="flex gap-4 flex-1 min-w-0">
          <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-theme-subtle border border-theme-border flex items-center justify-center">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className="object-cover w-full h-full rounded-lg"
              />
            ) : isAccessory ? (
              <Lock className="w-7 h-7 text-theme-muted" />
            ) : (
              <Package className="w-8 h-8 text-theme-muted" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold leading-tight">{item.name}</h3>

            <div className="flex flex-wrap gap-1.5 mt-1.5 mb-3">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                ✓ In Stock
              </span>
              {item.sku && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-theme-subtle text-theme-muted border border-theme-border">
                  SKU: {item.sku}
                </span>
              )}
              {item.size && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-theme-subtle text-theme-muted border border-theme-border">
                  {item.size}
                </span>
              )}
              {item.condition && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-theme-subtle text-theme-muted border border-theme-border">
                  {item.condition}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Qty stepper */}
              <div className="flex items-center border border-theme-border rounded-md overflow-hidden">
                <button
                  onClick={() => updateQty(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center bg-theme-subtle hover:bg-theme-primary hover:text-white text-theme-muted transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center text-sm font-bold bg-white border-x border-theme-border">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQty(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center bg-theme-subtle hover:bg-theme-primary hover:text-white text-theme-muted transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="flex items-center gap-1 text-xs font-semibold text-theme-muted hover:text-theme-primary transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>

              {item.shipNote && (
                <span className="text-[11px] font-semibold text-green-600">{item.shipNote}</span>
              )}
            </div>
          </div>
        </div>

        {/* Price column */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 pl-20 sm:pl-0 shrink-0">
          <div className="text-2xl font-extrabold leading-none">
            {fmt(item.price * item.quantity)}
          </div>
          <div className="flex sm:flex-col items-center sm:items-end gap-1.5 sm:gap-1">
            {item.originalPrice && (
              <span className="text-xs text-theme-muted line-through">
                {fmt(item.originalPrice * item.quantity)}
              </span>
            )}
            <span className="text-xs text-theme-muted">{fmt(item.price)} / unit</span>
            {item.orderType && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${
                  isAccessory ? 'bg-green-600' : 'bg-theme-accent'
                }`}
              >
                {item.orderType.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
