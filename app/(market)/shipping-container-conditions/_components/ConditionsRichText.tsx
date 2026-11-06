import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import type { ConditionsSegment } from '@/lib/data/containerConditionsContent'

type Props = {
  segments: readonly ConditionsSegment[]
  className?: string
}

const LINK = 'font-semibold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400'

/** A paragraph whose links sit inside the sentence, as on WordPress. Off-site links stay plain anchors. */
export function ConditionsRichText({ segments, className }: Props) {
  return (
    <p className={className}>
      {segments.map((segment, i) => {
        if (typeof segment === 'string') return segment
        return segment.href.startsWith('/') ? (
          <Link key={i} href={segment.href} className={LINK}>
            {segment.text}
          </Link>
        ) : (
          <a key={i} href={segment.href} rel="noopener" className={LINK}>
            {segment.text}
          </a>
        )
      })}
    </p>
  )
}
