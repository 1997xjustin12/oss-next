'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { GuestCartCaptureModal } from '@/components/cart/GuestCartCaptureModal'
import { dismissGuestCapture, isGuestCaptureSuppressed, setGuestEmail } from '@/lib/guestCapture'
import { ROUTES } from '@/config/routes'

// Never on cart/checkout (already mid-conversion there) or my-account
// (login/register/dashboard, not a guest-shopping flow).
const EXCLUDED_PATHS: string[] = [ROUTES.CHECKOUT, ROUTES.CART, ROUTES.ACCOUNT.ROOT]

// Don't arm on an instant bounce — only count real dwell time as "engaged."
const ARM_DELAY_MS = 15_000

// Guest-only cart-save prompt, hybrid-triggered: exit-intent on desktop
// (cursor leaves through the top of the viewport, the standard "about to
// leave" signal), tab-backgrounded on mobile (no cursor to read exit-intent
// from). At most once per mount, further capped across visits by
// isGuestCaptureSuppressed() (already captured, or dismissed recently).
export function GuestCartCapture() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const { cart } = useCart()
  const [open, setOpen] = useState(false)

  const armedRef = useRef(false)
  const firedRef = useRef(false)

  const eligible =
    !isAuthenticated &&
    cart.totalItems > 0 &&
    !EXCLUDED_PATHS.some((p) => pathname.startsWith(p)) &&
    !isGuestCaptureSuppressed()

  useEffect(() => {
    if (!eligible) return

    const armTimer = setTimeout(() => {
      armedRef.current = true
    }, ARM_DELAY_MS)

    function fire() {
      if (!armedRef.current || firedRef.current) return
      firedRef.current = true
      setOpen(true)
    }

    function onMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) fire()
    }

    function onVisibility() {
      if (document.visibilityState === 'hidden') fire()
    }

    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      clearTimeout(armTimer)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [eligible])

  return (
    <GuestCartCaptureModal
      open={open}
      onCapture={(email) => {
        setGuestEmail(email)
        setOpen(false)
      }}
      onDismiss={() => {
        dismissGuestCapture()
        setOpen(false)
      }}
    />
  )
}
