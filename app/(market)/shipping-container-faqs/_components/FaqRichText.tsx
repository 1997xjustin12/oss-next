import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import type { FaqInline } from '@/lib/data/faqsContent'

type Props = { content: readonly FaqInline[] }

const LINK = 'font-semibold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400'

/**
 * A run of text with its links and bold parts inside the sentence, as on
 * WordPress. Internal links prefetch on hover; off-site and tel: links stay
 * plain anchors.
 */
export function FaqRichText({ content }: Props) {
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
          <a key={i} href={part.href} rel={part.href.startsWith('http') ? 'noopener' : undefined} className={LINK}>
            {part.text}
          </a>
        )
      })}
    </>
  )
}
