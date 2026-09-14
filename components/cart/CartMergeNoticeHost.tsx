'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { CART_MERGE_NOTICE_EVENT, type CartMergeNotice } from '@/lib/cart'

/**
 * Explains a login merge that had to remove something.
 *
 * When a guest signs in, their cart is merged into the account's saved cart.
 * If both hold containers from different depots, only one order location can
 * stay: the guest's containers are kept and the saved ones from the other depot
 * are removed. Removing something from someone's cart without saying so is
 * worse than not merging at all, so this says so — once, right after login.
 *
 * Mounted once inside CartProvider and triggered by event, like the location
 * conflict prompt, so it works on whatever page the visitor signs in from.
 */
export function CartMergeNoticeHost() {
  const [notice, setNotice] = useState<CartMergeNotice | null>(null)

  useEffect(() => {
    function onNotice(event: Event) {
      setNotice((event as CustomEvent<CartMergeNotice>).detail)
    }
    window.addEventListener(CART_MERGE_NOTICE_EVENT, onNotice)
    return () => window.removeEventListener(CART_MERGE_NOTICE_EVENT, onNotice)
  }, [])

  if (!notice || notice.removed.length === 0) return null

  const close = () => setNotice(null)

  return (
    <Modal
      open
      onClose={close}
      title="We updated your cart"
      footer={
        <button
          type="button"
          onClick={close}
          className="flex-1 inline-flex items-center justify-center rounded-md bg-theme-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-theme-primary-dark"
        >
          Got it
        </button>
      }
    >
      <div className="flex flex-col gap-3 text-sm">
        <p>
          Each order ships from one location. You added a container from{' '}
          <strong>{notice.keptLocation}</strong> before signing in, so we kept it and removed{' '}
          {notice.removed.length === 1 ? 'this item' : 'these items'} from your saved cart:
        </p>
        <ul className="rounded-lg border border-theme-border bg-theme-subtle px-4 py-3 text-xs dark:border-neutral-800 dark:bg-white/5">
          {notice.removed.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-1">
              <span className="font-semibold text-theme-dark dark:text-white">{item.name}</span>
              <span className="shrink-0 text-theme-muted">{item.location}</span>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
