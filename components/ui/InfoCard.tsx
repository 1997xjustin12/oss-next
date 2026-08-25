import Link from 'next/link'
import type { ReactNode } from 'react'
import { SITE_URL } from '@/config/site'

type Props = {
  /**
   * The lines to show, in order. The first reads as the card's label and the
   * rest as its detail, though they are styled identically — the emphasis
   * comes from the copy, not the markup.
   */
  items: ReactNode[]
  /**
   * Makes the whole card a link. Omit it and the card is inert, so the same
   * component covers both cases without a caller wrapping it in an anchor —
   * a link around a link is invalid HTML and easy to end up with otherwise.
   */
  href?: string
  /** Appended to the card's own classes, for spacing or width at the call site. */
  className?: string
}

const CARD = 'block rounded-[10px] bg-[#F4F4F4] p-7'

/**
 * The path to navigate to internally, or null when the href is genuinely
 * off-site.
 *
 * A relative href is already internal. An absolute one is internal only when it
 * points at our own host — links are often pasted in absolute form, and sending
 * a visitor to a new tab on the site they are already reading is a bug that
 * looks like a design choice.
 */
function toInternalPath(href: string): string | null {
  if (!/^https?:\/\//i.test(href)) return href

  try {
    const url = new URL(href)
    const own = new URL(SITE_URL)
    return url.host === own.host ? `${url.pathname}${url.search}${url.hash}` : null
  } catch {
    // Unparseable — treat it as external rather than guessing.
    return null
  }
}

/** Only shown when the card actually goes somewhere. */
const INTERACTIVE =
  'transition-colors hover:bg-[#ebebeb] focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary'

/**
 * A soft grey panel holding a short list of facts, optionally linked.
 *
 * Deliberately unopinionated: it takes whatever lines you give it and renders
 * them in the shared card shell, so a caller decides what the card is *about*
 * and this decides what a card *looks like*. Keeping those separate is the
 * whole reason it exists — the alternative is the same twenty lines of markup
 * copied wherever a panel is needed, drifting apart one padding value at a time.
 */
export function InfoCard({ items, href, className = '' }: Props) {
  if (items.length === 0) return null

  const content = (
    <ul className="text-[14px]">
      {items.map((item, i) => (
        // Index keys are safe here: the list is static content passed in by the
        // caller, never reordered or filtered.
        <li key={i} className="text-[#33363F]">
          {item}
        </li>
      ))}
    </ul>
  )

  if (!href) {
    return <div className={`${CARD} ${className}`.trim()}>{content}</div>
  }

  // A URL on our own domain is treated as internal even when it is written
  // absolutely, so it navigates client-side and doesn't open a second tab onto
  // the site the visitor is already on.
  const target = toInternalPath(href)
  const classes = `${CARD} ${INTERACTIVE} ${className}`.trim()

  if (target === null) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    )
  }

  return (
    <Link href={target} className={classes}>
      {content}
    </Link>
  )
}
