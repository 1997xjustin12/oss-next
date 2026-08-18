import Link from 'next/link'
import { ROUTES } from '@/config/routes'

type Props = {
  page: number
  totalPages: number
  search?: string
}

/** Server-rendered pager built from the list response's resolved totalPages.
 *  Hidden below 2 pages, so an empty category can't render bare disabled
 *  arrows. Preserves the active search across page links. */
export function Pager({ page, totalPages, search }: Props) {
  if (totalPages < 2) return null

  const href = (p: number) => {
    const qs = new URLSearchParams()
    if (p > 1) qs.set('page', String(p))
    if (search) qs.set('search', search)
    const q = qs.toString()
    return q ? `${ROUTES.BLOGS}?${q}` : ROUTES.BLOGS
  }

  // Windowed page numbers around the current page.
  const window = 2
  const start = Math.max(1, page - window)
  const end = Math.min(totalPages, page + window)
  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const base =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-bold transition-colors'
  const idle =
    'border-theme-border bg-theme-bg text-theme-dark-2 hover:border-theme-primary hover:text-theme-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-red-400'
  const active = 'border-theme-primary bg-theme-primary text-white'
  const disabled = 'pointer-events-none opacity-40'

  return (
    <nav aria-label="Blog pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <Link
        href={href(page - 1)}
        aria-label="Previous page"
        aria-disabled={page <= 1}
        className={`${base} ${idle} ${page <= 1 ? disabled : ''}`}
      >
        ← Prev
      </Link>

      {start > 1 && (
        <>
          <Link href={href(1)} className={`${base} ${idle}`}>1</Link>
          {start > 2 && <span className="px-1 text-theme-muted">…</span>}
        </>
      )}

      {numbers.map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? 'page' : undefined}
          className={`${base} ${n === page ? active : idle}`}
        >
          {n}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-theme-muted">…</span>}
          <Link href={href(totalPages)} className={`${base} ${idle}`}>{totalPages}</Link>
        </>
      )}

      <Link
        href={href(page + 1)}
        aria-label="Next page"
        aria-disabled={page >= totalPages}
        className={`${base} ${idle} ${page >= totalPages ? disabled : ''}`}
      >
        Next →
      </Link>
    </nav>
  )
}
