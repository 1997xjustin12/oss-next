'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, ShoppingCart } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import type { CartItem } from '@/types/cart'

type Props = {
  item:    CartItem | null
  onClose: () => void
}

const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export function AddedToCartModal({ item, onClose }: Props) {
  return (
    <Modal
      open={item !== null}
      onClose={onClose}
      title="Added to Cart!"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border-2 border-theme-border px-4 py-2.5 text-sm font-bold text-theme-dark dark:text-white dark:border-neutral-700 hover:border-theme-primary hover:text-theme-primary transition-colors"
          >
            Continue Shopping
          </button>
          <Link
            href="/cart"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-theme-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-theme-primary-dark transition-colors"
          >
            <ShoppingCart className="w-4 h-4" /> View Cart
          </Link>
        </>
      }
    >
      {item && (
        <div className="flex items-center gap-3.5">
          <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          {item.image && (
            <div className="shrink-0 w-14 h-14 rounded-lg bg-theme-subtle dark:bg-white/5 border border-theme-border dark:border-neutral-800 overflow-hidden">
              <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-theme-dark dark:text-white truncate">{item.name}</p>
            <p className="text-xs text-theme-muted">Qty {item.quantity} · {fmt(item.price)}</p>
          </div>
        </div>
      )}
    </Modal>
  )
}
