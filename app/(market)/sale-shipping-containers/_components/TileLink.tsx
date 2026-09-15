'use client'

import Link, { useLinkStatus } from 'next/link'

type Props = {
  href:     string
  rounded:  keyof typeof RADIUS
  children: React.ReactNode
}

// Literal class names so Tailwind sees them; matches the tile's own radius.
const RADIUS = {
  lg: { link: 'after:rounded-lg', overlay: 'rounded-lg' },
  xl: { link: 'after:rounded-xl', overlay: 'rounded-xl' },
} as const

/**
 * A listing tile's title as a real link whose click area covers the whole tile.
 *
 * The tiles used to be `<article onClick={router.push}>` with no `<a href>`, so
 * crawlers could not follow them and middle-click / "open in new tab" did
 * nothing. The link's `::after` stretches over the nearest positioned ancestor
 * (the tile, which must be `relative`); anything else interactive inside the
 * tile needs `relative z-10` to sit above it.
 */
export function TileLink({ href, rounded, children }: Props) {
  return (
    <Link
      href={href}
      className={`after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-theme-primary ${RADIUS[rounded].link}`}
    >
      {children}
      <PendingOverlay rounded={rounded} />
    </Link>
  )
}

// Replaces the old click-state spinner. It follows the navigation itself, so a
// Ctrl/middle-click that opens a new tab no longer leaves a spinner stuck on.
function PendingOverlay({ rounded }: { rounded: Props['rounded'] }) {
  const { pending } = useLinkStatus()
  if (!pending) return null
  return (
    <span
      aria-hidden
      className={`absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 ${RADIUS[rounded].overlay}`}
    >
      <span className="h-6 w-6 rounded-full border-[3px] border-theme-primary border-t-transparent animate-spin" />
    </span>
  )
}
