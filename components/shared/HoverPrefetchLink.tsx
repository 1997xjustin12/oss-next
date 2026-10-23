'use client'

import Link from 'next/link'
import { useState, type ComponentProps } from 'react'

type Props = ComponentProps<typeof Link>

/**
 * A `next/link` that prefetches when the visitor shows intent — pointer over
 * it, a finger on it, keyboard focus — instead of when it scrolls into view.
 *
 * The default viewport prefetch fetched every nav and footer link on every
 * page load (13–24 RSC requests per view, measured 2026-10-22), almost none of
 * them followed. A touch gives roughly 100–300 ms of head start before the
 * click, enough for the static shell of most routes. The pattern is the one in
 * the Next docs (guides/prefetching, "Hover-triggered prefetch"), extended to
 * touch and focus.
 *
 * A caller that passes `prefetch` itself gets exactly that, untouched.
 * Server Components may render this: only the anchor hydrates.
 */
export function HoverPrefetchLink({ prefetch, onMouseEnter, onTouchStart, onFocus, ...props }: Props) {
  const [active, setActive] = useState(false)

  if (prefetch !== undefined) {
    return <Link prefetch={prefetch} onMouseEnter={onMouseEnter} onTouchStart={onTouchStart} onFocus={onFocus} {...props} />
  }

  return (
    <Link
      {...props}
      // `null` restores Next's default prefetch once intent is shown.
      prefetch={active ? null : false}
      onMouseEnter={(e) => {
        setActive(true)
        onMouseEnter?.(e)
      }}
      onTouchStart={(e) => {
        setActive(true)
        onTouchStart?.(e)
      }}
      onFocus={(e) => {
        setActive(true)
        onFocus?.(e)
      }}
    />
  )
}
