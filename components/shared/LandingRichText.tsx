import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import type { LandingInline } from '@/lib/data/containerLandingContent'

type Props = { content: readonly LandingInline[] }

const LINK = 'font-semibold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400'

/**
 * A run of text with its links and bold parts inside the sentence, as on
 * WordPress (the for-sale and rental pages). Internal links prefetch on hover;
 * tel: and off-site links stay plain anchors.
 */
export function LandingRichText({ content }: Props) {
  return (
    <>
      {content.map((part, i) => {
        if (typeof part === 'string') return part
        if ('strong' in part) {
          return (
            <strong key={i} className="font-bold text-theme-dark dark:text-white">
              {part.strong}
            </strong>
          )
        }
        return part.href.startsWith('/') ? (
          <Link key={i} href={part.href} className={LINK}>
            {part.text}
          </Link>
        ) : (
          <a key={i} href={part.href} className={`${LINK} whitespace-nowrap`}>
            {part.text}
          </a>
        )
      })}
    </>
  )
}
