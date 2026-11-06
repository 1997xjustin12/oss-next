import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import type { CargoSegment } from '@/lib/data/cargoWorthyContent'

type Props = {
  segments: readonly CargoSegment[]
  className?: string
}

const LINK = 'font-semibold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400'

/** A paragraph whose links sit inside the sentence, as on WordPress. */
export function CargoRichText({ segments, className }: Props) {
  return (
    <p className={className}>
      {segments.map((segment, i) =>
        typeof segment === 'string' ? (
          segment
        ) : (
          <Link key={i} href={segment.href} className={`${LINK} ${segment.bold ? 'font-extrabold' : ''}`}>
            {segment.text}
          </Link>
        ),
      )}
    </p>
  )
}
