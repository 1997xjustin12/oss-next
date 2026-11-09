import { CircleArrowRight } from 'lucide-react'
import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import { PlpLink } from '@/components/shared/PlpLink'
import { ROUTES } from '@/config/routes'
import type { ReactNode } from 'react'

type Props = {
  href: string
  children: ReactNode
  /** `red` (the default) or `amber`, the for-sale page's "Get a FREE Quote". */
  tone?: 'red' | 'amber'
  className?: string
}

const TONES = {
  red: 'bg-theme-primary text-white hover:bg-theme-primary-dark focus-visible:outline-theme-primary',
  // Dark text on amber-500: the pair that passes 4.5:1 (migration doc §7).
  amber: 'bg-amber-500 text-neutral-950 hover:bg-amber-400 focus-visible:outline-amber-500',
} as const

/**
 * The rounded button with a circled arrow that the WordPress landing pages use
 * for their calls to action. A link to the listing carries the visitor's ZIP
 * (PlpLink); another page of this site prefetches on hover; a call or email
 * link is a plain anchor; an off-site link opens in a new tab.
 */
export function PillLink({ href, children, tone = 'red', className = '' }: Props) {
  const classes = `inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-md transition-colors
                   focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-base ${TONES[tone]} ${className}`
  const content = (
    <>
      {children}
      <CircleArrowRight aria-hidden className="h-5 w-5 shrink-0" />
    </>
  )

  if (href.startsWith(ROUTES.PLP)) return <PlpLink href={href} className={classes}>{content}</PlpLink>
  if (href.startsWith('/')) return <Link href={href} className={classes}>{content}</Link>
  if (/^(tel|mailto):/.test(href)) return <a href={href} className={classes}>{content}</a>
  return (
    <a href={href} target="_blank" rel="noopener" className={classes}>
      {content}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
