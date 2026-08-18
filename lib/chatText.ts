import { MAX_HANDLE_CHARS, MAX_PRODUCT_HANDLES } from '@/config/chat'

/**
 * Turning an assistant reply into something safe to render.
 *
 * Two jobs, both about not trusting model output:
 *
 *  1. Pull the product handles out, so cards are drawn from *our* catalogue.
 *     A card can then never point at a page that does not exist, or show a
 *     price the model invented — an unknown handle simply doesn't come back
 *     and no card is drawn.
 *  2. Take the raw URLs out of the prose, because the cards replace them.
 *
 * The reply is rendered as React elements, never through
 * dangerouslySetInnerHTML — see components/chat/RichText.tsx.
 */

/**
 * Product links in a reply. Global, with a capture group for the handle.
 *
 * Kept separate from URL_SPLIT below on purpose: `.test()` and `.exec()` on a
 * `/g` regex advance `lastIndex` between calls, so sharing one instance across
 * both jobs would silently match every *other* link.
 */
/**
 * Square brackets are excluded along with parentheses. Without that, a link
 * written as `[https://…/product/abc]` captures the handle as `abc]`, which
 * then resolves to nothing and silently costs the shopper a card.
 */
const PRODUCT_URL = /https?:\/\/[^\s<>()[\]]*\/product\/([^\s<>()[\]/?#]+)/gi

/** Any URL, for splitting prose into text and link parts. Keeps its group. */
export const URL_SPLIT = /(https?:\/\/[^\s<>()[\]]+)/gi

/** Non-global twin of the above, safe to call `.test()` on repeatedly. */
export const URL_TEST = /^https?:\/\/[^\s<>()[\]]+$/i

/**
 * The product handles a reply mentions, in order, de-duplicated and capped.
 *
 * Works off `matchAll` rather than a shared regex cursor, so calling this twice
 * on the same string gives the same answer.
 */
export function extractProductHandles(reply: string): string[] {
  if (!reply) return []

  const handles: string[] = []
  const seen = new Set<string>()

  for (const match of reply.matchAll(PRODUCT_URL)) {
    const raw = match[1]
    if (!raw || raw.length > MAX_HANDLE_CHARS) continue

    let handle: string
    try {
      handle = decodeURIComponent(raw)
    } catch {
      // Malformed percent-encoding — keep the raw value rather than dropping a
      // handle that might still resolve.
      handle = raw
    }

    const key = handle.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    handles.push(handle)

    if (handles.length >= MAX_PRODUCT_HANDLES) break
  }

  return handles
}

/**
 * Remove product URLs from the prose and tidy the wreckage they leave.
 *
 * Deleting a URL on its own leaves the punctuation that introduced it and a
 * hole where it sat — `"the 20ft ( )"`, a trailing colon before nothing, or the
 * run of blank lines a stripped list of links collapses into. Each cleanup step
 * below exists because of one of those.
 */
export function stripProductUrls(reply: string): string {
  if (!reply) return ''

  return (
    reply
      .replace(PRODUCT_URL, '')
      // Markdown link whose target we just removed: keep the label.
      .replace(/\[([^\]]*)\]\(\s*\)/g, '$1')
      // Brackets left holding nothing.
      .replace(/\(\s*\)/g, '')
      .replace(/\[\s*\]/g, '')
      // Runs of spaces/tabs, without touching newlines.
      .replace(/[^\S\n]{2,}/g, ' ')
      // A space that ended up before punctuation.
      .replace(/[^\S\n]+([,.;:!?])/g, '$1')
      // Punctuation that was introducing the link, now at end of line.
      .replace(/[ \t]*[:\-–—]+[ \t]*$/gm, '')
      // Trailing spaces on any line.
      .replace(/[ \t]+$/gm, '')
      // Three or more newlines collapse to a paragraph break.
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}
