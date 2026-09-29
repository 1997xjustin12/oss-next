'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Container, ShoppingCart } from 'lucide-react'

/**
 * The phone-and-tablet add-to-cart bar, pinned to the bottom of the viewport.
 *
 * On a narrow screen the ordering block sits a long way down the product page —
 * past the gallery, the specifications and the summary — so deciding to buy
 * means scrolling back up to find the button. This keeps the container, its
 * price and the action within reach wherever the visitor has got to.
 *
 * ## Two things it must not get wrong
 *
 * **It cannot show a different container to the one it adds.** Everything it
 * renders is passed in from the panel's own state — the same `activeProduct`
 * and `priceDisplay` the ordering block reads — and pressing it calls the
 * panel's own handler rather than a copy of it. So a variant swap or a depot
 * change moves both together, and there is no second code path that could
 * drift from the first and add something the visitor was not looking at.
 *
 * **It cannot bury the chat launcher.** That launcher is a 56px circle fixed at
 * `bottom-5 right-5`, which a full-width bar would sit directly underneath.
 * While this is on screen it publishes its height as `--sticky-cart-h` on the
 * document element, and the launcher raises itself by that much — CSS only, so
 * the two never have to know about each other beyond the variable's name.
 *
 * Hidden from `lg` up, where the ordering panel is beside the gallery and in
 * view already.
 */

export function MobileAddToCartBar({
  image,
  title,
  price,
  priceSuffix,
  label,
  disabled,
  onAddToCart,
  /**
   * The real Add To Cart button. The bar appears only once this has scrolled
   * out of view — while it is on screen the bar would be a second copy of a
   * control the visitor can already see, covering content to offer it.
   */
  watch,
}: {
  image: string | null
  title: string
  price: string
  priceSuffix?: string
  label: string
  disabled: boolean
  onAddToCart: () => void
  watch: React.RefObject<HTMLElement | null>
}) {
  const [visible, setVisible] = useState(false)
  /**
   * Plays once, the first time the bar appears.
   *
   * Tied to the first appearance rather than every one: the bar comes and goes
   * as the ordering block scrolls past, and a button that jumps each time is
   * one people learn to look past — the opposite of emphasis.
   */
  const [nudge, setNudge] = useState(false)
  const hasNudged = useRef(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = watch.current
    // No target means the ordering block has not rendered. Staying hidden is
    // the safe answer: a bar with nothing to mirror could offer a stale price.
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      // A sliver counts as visible, so the bar does not flicker in and out
      // while the button is half off the bottom edge.
      { threshold: 0.1 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [watch])

  useEffect(() => {
    if (!visible || hasNudged.current) return
    hasNudged.current = true
    setNudge(true)
    const timer = setTimeout(() => setNudge(false), 900)
    return () => clearTimeout(timer)
  }, [visible])

  // Publish the height for the chat launcher to clear. Measured rather than
  // hard-coded: the title wraps to two lines on a narrow phone, and a guessed
  // number would leave the launcher overlapping on exactly those pages.
  useEffect(() => {
    const root = document.documentElement
    if (!visible) {
      root.style.removeProperty('--sticky-cart-h')
      return
    }

    const bar = barRef.current
    const apply = () => root.style.setProperty('--sticky-cart-h', `${bar?.offsetHeight ?? 0}px`)
    apply()

    const observer = new ResizeObserver(apply)
    if (bar) observer.observe(bar)
    return () => {
      observer.disconnect()
      root.style.removeProperty('--sticky-cart-h')
    }
  }, [visible])

  return (
    <div
      ref={barRef}
      // Always mounted, translated out of the way — an element that leaves the
      // DOM cannot be measured or transitioned, and the height it publishes is
      // what the launcher positions against.
      className={[
        'fixed inset-x-0 bottom-0 z-9980 border-t-2 border-theme-primary bg-theme-bg shadow-[0_-8px_28px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-out lg:hidden dark:bg-neutral-900',
        visible ? 'translate-y-0' : 'pointer-events-none translate-y-full',
      ].join(' ')}
      // Hidden from assistive tech and from tab order while off screen, so a
      // keyboard user is not sent to a control nobody can see.
      aria-hidden={!visible}
      inert={!visible}
    >
      {/* Padded for the home indicator on a phone with no hardware button. */}
      <div className="flex items-center gap-3 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-md bg-theme-subtle dark:bg-neutral-800">
          {image ? (
            <Image src={image} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <Container
              className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-theme-muted"
              aria-hidden
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-[11px] font-medium leading-tight text-theme-muted">
            {title}
          </p>
          <p className="mt-0.5 text-lg font-extrabold leading-none tracking-tight text-theme-dark dark:text-white">
            {price}
            {priceSuffix ? (
              <span className="text-[11px] font-semibold text-theme-muted">{priceSuffix}</span>
            ) : null}
          </p>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={disabled}
          className={[
            'inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-theme-primary px-5 text-sm font-bold uppercase tracking-wide text-white',
            // A ring rather than a heavier shadow: on a white bar the glow is
            // what separates the button from the surface it sits on.
            'shadow-[0_4px_14px_rgba(189,17,42,0.45)] ring-2 ring-theme-primary/30',
            'transition-colors hover:bg-theme-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:ring-0',
            nudge ? 'sticky-cart-nudge' : '',
          ].join(' ')}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden />
          {label}
        </button>
      </div>
    </div>
  )
}
