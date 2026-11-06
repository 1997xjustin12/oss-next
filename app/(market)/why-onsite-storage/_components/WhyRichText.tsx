import { HoverPrefetchLink as Link } from '@/components/shared/HoverPrefetchLink'
import type { WhyRich } from '@/lib/data/whyOnsiteContent'

type Props = {
  parts: WhyRich
  /** Link colour for the section's background: 'light' sections or 'dark' (blue) ones. */
  tone?: 'light' | 'dark'
}

/** A sentence with links in it, the links underlined as every in-text link here is. */
export function WhyRichText({ parts, tone = 'light' }: Props) {
  const linkClass =
    tone === 'dark'
      ? 'font-semibold text-[#F4BF3C] underline underline-offset-2 hover:no-underline'
      : 'font-semibold text-theme-primary underline underline-offset-2 hover:no-underline dark:text-red-400'

  return (
    <>
      {parts.map((part, i) =>
        typeof part === 'string' ? (
          part
        ) : (
          <Link key={i} href={part.href} className={linkClass}>
            {part.text}
          </Link>
        ),
      )}
    </>
  )
}
