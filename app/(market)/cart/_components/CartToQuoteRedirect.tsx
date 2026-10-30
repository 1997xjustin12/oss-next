'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { readStoredCart } from '@/context/CartContext'
import { deliveryQuoteDestination } from '@/lib/checkoutRoute'

/**
 * /cart while CART_PAGE_GOES_TO_QUOTE is on (lib/checkoutRoute.ts): sends the
 * visitor to the delivery-quote form for their cart, the link a guest's
 * "Proceed to checkout" builds (the container's handle, their ZIP, the
 * quantity), so the quote is priced straight away.
 *
 * In the browser, because the cart and the ZIP live in localStorage. Read
 * straight from storage rather than through useCart(): the provider restores
 * the cart in an effect that runs after this one, so the cart would still be
 * empty here and the link would lose the container. `replace`, so Back does not
 * return to a page that only redirects.
 */
export function CartToQuoteRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace(deliveryQuoteDestination(readStoredCart().items))
  }, [router])

  return (
    <section aria-live="polite" className="page-fill flex items-center justify-center px-[5%] py-24">
      <p className="flex items-center gap-2 text-sm font-medium text-theme-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Taking you to your delivery quote…
      </p>
    </section>
  )
}
