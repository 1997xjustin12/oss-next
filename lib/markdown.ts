import { load, type CheerioAPI } from 'cheerio'
import type { AnyNode, Element } from 'domhandler'

/**
 * HTML → Markdown, for the machine-readable representation of pages whose
 * source is HTML we don't author.
 *
 * The ~1,700 converted WordPress pages reach an agent as deeply nested
 * Elementor `<div>`s carrying inline styles, wrapped in ~400KB of scoped theme
 * CSS. All of the meaning is in maybe 5% of those bytes. This walks the tree
 * and keeps that 5%: headings, prose, lists, tables, links and images. Every
 * layout wrapper is unwrapped rather than represented, because a wrapper is not
 * content.
 *
 * cheerio rather than a new dependency — it is already used to post-process
 * these exact pages in services/wp-pages.service.ts.
 */

/** Elements that carry no content and whose subtrees are never wanted. */
const DROPPED = new Set([
  'script', 'style', 'noscript', 'iframe', 'svg', 'canvas', 'form', 'input',
  'button', 'select', 'textarea', 'template', 'link', 'meta', 'nav', 'video',
  'audio', 'object', 'embed',
])

const BLOCK_LEVEL = new Set([
  'address', 'article', 'aside', 'blockquote', 'div', 'dl', 'fieldset',
  'figcaption', 'figure', 'footer', 'header', 'hr', 'main', 'ol', 'p', 'pre',
  'section', 'table', 'ul', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
])

export type MarkdownOptions = {
  /** Origin used to absolutise root-relative links and images. */
  baseUrl?: string
  /** Heading level the document starts at. Content nested under an existing
   *  H1 should pass 2 so the output has one top-level heading, not two. */
  startingHeadingLevel?: number
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ')
}

/** Markdown's structural characters, escaped only where they'd be parsed. */
function escapeText(text: string): string {
  return text.replace(/([\\`*_[\]])/g, '\\$1')
}

function absolutise(url: string | undefined, baseUrl: string | undefined): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (!baseUrl || /^(https?:|mailto:|tel:|#|data:)/i.test(trimmed)) return trimmed
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  return `${baseUrl.replace(/\/+$/, '')}/${trimmed.replace(/^\/+/, '')}`
}

class MarkdownWriter {
  private readonly $: CheerioAPI
  private readonly options: MarkdownOptions

  constructor($: CheerioAPI, options: MarkdownOptions) {
    this.$ = $
    this.options = options
  }

  /** Inline content only — used for headings, list items, table cells. */
  private inline(node: AnyNode): string {
    if (node.type === 'text') return escapeText(collapseWhitespace((node as { data: string }).data))
    if (node.type !== 'tag') return ''

    const el = node as Element
    const tag = el.tagName.toLowerCase()
    if (DROPPED.has(tag)) return ''

    const children = () => el.children.map((child) => this.inline(child)).join('')

    switch (tag) {
      case 'br':
        return ' '
      case 'strong':
      case 'b': {
        const inner = children().trim()
        return inner ? `**${inner}**` : ''
      }
      case 'em':
      case 'i': {
        const inner = children().trim()
        return inner ? `*${inner}*` : ''
      }
      case 'code': {
        // Backticks inside code would terminate the span — the content is
        // already escaped, so unescape before re-wrapping.
        const inner = children().trim().replace(/\\([\\`*_[\]])/g, '$1')
        return inner ? `\`${inner}\`` : ''
      }
      case 'a': {
        const text = children().trim()
        const href = absolutise(this.$(el).attr('href'), this.options.baseUrl)
        if (!text) return ''
        return href && !href.startsWith('#') ? `[${text}](${href})` : text
      }
      case 'img':
        return this.image(el)
      default:
        return children()
    }
  }

  private image(el: Element): string {
    const $el = this.$(el)
    // Lazy-loading themes park the real URL in data-src and leave src as a
    // 1px placeholder, so the plain src is the last thing checked, not the first.
    const src = absolutise(
      $el.attr('data-src') || $el.attr('data-lazy-src') || $el.attr('src'),
      this.options.baseUrl,
    )
    if (!src || src.startsWith('data:')) return ''
    const alt = collapseWhitespace($el.attr('alt') ?? '').trim()
    return `![${escapeText(alt)}](${src})`
  }

  private list(el: Element, ordered: boolean, depth: number): string {
    const indent = '  '.repeat(depth)
    const items: string[] = []

    this.$(el)
      .children('li')
      .each((index, li) => {
        const marker = ordered ? `${index + 1}.` : '-'

        // A nested list is a block inside the item, not part of its text —
        // split them so the item's own words stay on the marker's line.
        const nested: string[] = []
        const own: string[] = []
        for (const child of (li as Element).children) {
          const isList =
            child.type === 'tag' && ['ul', 'ol'].includes((child as Element).tagName.toLowerCase())
          if (isList) nested.push(this.list(child as Element, (child as Element).tagName.toLowerCase() === 'ol', depth + 1))
          else own.push(this.inline(child))
        }

        const text = collapseWhitespace(own.join('')).trim()
        if (!text && !nested.length) return
        items.push(`${indent}${marker} ${text}`.trimEnd())
        items.push(...nested.filter(Boolean))
      })

    return items.join('\n')
  }

  /**
   * Pipe table. Only tables with a usable header row are emitted as tables —
   * layout tables (still common in converted WordPress markup) would produce a
   * grid of meaningless columns, so they fall through to their text.
   */
  private table(el: Element): string {
    const $table = this.$(el)
    const rows: string[][] = []

    $table.find('tr').each((_, tr) => {
      const cells: string[] = []
      this.$(tr)
        .children('th, td')
        .each((__, cell) => {
          cells.push(collapseWhitespace(this.inline(cell)).trim().replace(/\|/g, '\\|'))
        })
      if (cells.some(Boolean)) rows.push(cells)
    })

    if (rows.length < 2) return ''

    const width = Math.max(...rows.map((row) => row.length))
    const pad = (row: string[]) => [...row, ...Array(width - row.length).fill('')]

    const [header, ...body] = rows
    return [
      `| ${pad(header).join(' | ')} |`,
      `| ${Array(width).fill('---').join(' | ')} |`,
      ...body.map((row) => `| ${pad(row).join(' | ')} |`),
    ].join('\n')
  }

  /** Block-level content. Returns an array of blocks, joined with blank lines. */
  block(node: AnyNode, depth = 0): string[] {
    if (node.type === 'text') {
      const text = collapseWhitespace((node as { data: string }).data).trim()
      return text ? [escapeText(text)] : []
    }
    if (node.type !== 'tag') return []

    const el = node as Element
    const tag = el.tagName.toLowerCase()
    if (DROPPED.has(tag)) return []

    const descend = () => el.children.flatMap((child) => this.block(child, depth))

    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        const text = collapseWhitespace(this.inline(el)).trim()
        if (!text) return []
        const base = this.options.startingHeadingLevel ?? 1
        const level = Math.min(6, Number(tag[1]) + base - 1)
        return [`${'#'.repeat(level)} ${text}`]
      }

      case 'p': {
        const text = collapseWhitespace(this.inline(el)).trim()
        return text ? [text] : []
      }

      case 'ul':
      case 'ol': {
        const list = this.list(el, tag === 'ol', 0)
        return list ? [list] : []
      }

      case 'table': {
        const table = this.table(el)
        // No header row means it's almost certainly a layout table — keep the
        // words, drop the grid.
        return table ? [table] : descend()
      }

      case 'blockquote': {
        const inner = el.children.flatMap((child) => this.block(child, depth)).join('\n\n')
        return inner ? [inner.split('\n').map((line) => `> ${line}`).join('\n')] : []
      }

      case 'pre': {
        const text = this.$(el).text().trim()
        return text ? ['```\n' + text + '\n```'] : []
      }

      case 'hr':
        return ['---']

      case 'img': {
        const image = this.image(el)
        return image ? [image] : []
      }

      default: {
        // An inline-only container (a <span> of prose inside a <div>) would be
        // lost by descending block-wise, so it's rendered as one paragraph.
        const hasBlockChild = el.children.some(
          (child) => child.type === 'tag' && BLOCK_LEVEL.has((child as Element).tagName.toLowerCase()),
        )
        if (hasBlockChild) return descend()

        const text = collapseWhitespace(this.inline(el)).trim()
        return text ? [text] : []
      }
    }
  }
}

/**
 * Convert a fragment of HTML to Markdown.
 *
 * Consecutive duplicate blocks are collapsed: converted Elementor pages
 * routinely carry the same heading twice, once for the desktop layout and once
 * for mobile, and both are real elements in the DOM.
 */
export function htmlToMarkdown(html: string, options: MarkdownOptions = {}): string {
  if (!html?.trim()) return ''

  const $ = load(html, null, false)
  const writer = new MarkdownWriter($, options)

  const root = $.root()[0] as unknown as { children: AnyNode[] }
  const blocks = (root.children ?? []).flatMap((node) => writer.block(node))

  const deduped: string[] = []
  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue
    if (deduped[deduped.length - 1] === trimmed) continue
    deduped.push(trimmed)
  }

  return deduped.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()
}

/** Strip HTML to its text, for excerpts and one-line descriptions. */
export function htmlToPlainText(html: string, maxLength?: number): string {
  if (!html?.trim()) return ''
  const $: CheerioAPI = load(html, null, false)
  $(Array.from(DROPPED).join(',')).remove()
  const text = collapseWhitespace($.root().text()).trim()
  if (!maxLength || text.length <= maxLength) return text
  // Cut at a word boundary so the summary doesn't end mid-word.
  return `${text.slice(0, text.lastIndexOf(' ', maxLength) || maxLength).trimEnd()}…`
}
