'use client'

import Link from 'next/link'
import { MapPinOff, Trash2, ArrowRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

type Props = {
  open:            boolean
  onClose:         () => void
  currentLocation: string
  newLocation:     string
  onClearCart:     () => void
}

export function CartLocationConflictModal({ open, onClose, currentLocation, newLocation, onClearCart }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="One Pickup Location at a Time"
      footer={
        <>
          <button
            type="button"
            onClick={() => { onClearCart(); onClose() }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border-2 border-theme-border px-4 py-2.5 text-sm font-bold text-theme-dark dark:text-white dark:border-neutral-700 hover:border-theme-primary hover:text-theme-primary transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear Cart
          </button>
          <Link
            href="/checkout"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-theme-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-theme-primary-dark transition-colors"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-theme-primary-light dark:bg-theme-primary/15">
          <MapPinOff className="w-6 h-6 text-theme-primary" />
        </div>

        <p className="text-center">
          For a smooth delivery process, you can only add shipping containers from the{' '}
          <strong>same location</strong> to your cart.
        </p>

        <div className="rounded-lg bg-theme-subtle dark:bg-white/5 border border-theme-border dark:border-neutral-800 px-4 py-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold uppercase tracking-wide text-theme-muted">In Your Cart</span>
            <span className="font-semibold text-theme-dark dark:text-white">{currentLocation}</span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-theme-border dark:border-neutral-800">
            <span className="font-bold uppercase tracking-wide text-theme-muted">This Container</span>
            <span className="font-semibold text-theme-primary">{newLocation}</span>
          </div>
        </div>

        <p className="text-center text-xs text-theme-muted">
          Clear your cart to start a new order at this location, or complete checkout for your current order first.
        </p>
      </div>
    </Modal>
  )
}
