'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { AlertTriangle, Loader2, Search } from 'lucide-react'
import { getGbpBlogPostAction, searchGbpBlogPostsAction, type GbpBlogOption } from '@/actions/gbp'
import { formatBlogDate } from '@/lib/blog'
import { HELP, INPUT, LABEL } from './ValueEditor'

type Props = {
  /** The picked post's slug; empty until one is picked. */
  value: string
  onChange: (slug: string) => void
}

/** A post's thumbnail, title and date: one row of the list, or the picked post. */
function PostRow({ post }: { post: GbpBlogOption }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      {post.imageUrl ? (
        // A thumbnail in the admin, not page content.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" width={64} height={36} className="h-9 w-16 shrink-0 rounded object-cover" />
      ) : (
        <span aria-hidden className="h-9 w-16 shrink-0 rounded bg-theme-subtle dark:bg-neutral-800" />
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-theme-dark dark:text-neutral-100">{post.title}</span>
        {post.date && <span className="block text-xs text-theme-muted dark:text-neutral-500">{formatBlogDate(post.date)}</span>}
      </span>
    </span>
  )
}

/**
 * Picks a published post for a GBP blog card: type to search titles, then
 * choose from the list (thumbnail, title, date). With nothing typed it lists
 * the newest posts. Only published posts are listed, and the page renders the
 * card from the post itself, so an unpublished post drops off the page.
 */
export function GbpBlogPostPicker({ value, onChange }: Props) {
  const id = useId()
  const listId = `${id}-list`
  const [picked, setPicked] = useState<GbpBlogOption | null | undefined>(undefined)
  const [searching, setSearching] = useState(!value)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<GbpBlogOption[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // The picked post, to show what the card will be (or that it is gone).
  useEffect(() => {
    if (!value) return
    let live = true
    getGbpBlogPostAction(value).then((post) => live && setPicked(post), () => live && setPicked(null))
    return () => {
      live = false
    }
  }, [value])

  // Search as they type, a moment after they stop.
  useEffect(() => {
    if (!open) return
    let live = true
    const timer = setTimeout(() => {
      setLoading(true)
      searchGbpBlogPostsAction(query)
        .then((posts) => {
          if (!live) return
          setOptions(posts)
          setActive(0)
        })
        .catch(() => live && setOptions([]))
        .finally(() => live && setLoading(false))
    }, 250)
    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [query, open])

  const choose = (post: GbpBlogOption) => {
    setPicked(post)
    onChange(post.slug)
    setSearching(false)
    setOpen(false)
    setQuery('')
  }

  if (!searching && value) {
    return (
      <div>
        <p className={LABEL}>Post from the blog list</p>
        <div className="mt-1 flex items-center justify-between gap-3 rounded-md border border-theme-border bg-theme-bg p-2 dark:border-neutral-700 dark:bg-neutral-950">
          {picked ? (
            <PostRow post={picked} />
          ) : picked === null ? (
            <span className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              “{value}” is not a published post, so the page leaves this card out.
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm text-theme-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading the post…
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setSearching(true)
              setOpen(true)
              requestAnimationFrame(() => inputRef.current?.focus())
            }}
            className="shrink-0 rounded-md border border-theme-border px-3 py-1.5 text-sm font-semibold text-theme-mid hover:bg-theme-subtle dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Change
          </button>
        </div>
        <p className={HELP}>The card shows this post’s title, excerpt and image, and links to it.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <label htmlFor={id} className={LABEL}>
        Post from the blog list
      </label>
      <div className="relative mt-1">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-theme-muted" />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && options[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          placeholder="Search published posts by title"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
              setActive((i) => Math.min(i + 1, options.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter' && open && options[active]) {
              e.preventDefault()
              choose(options[active])
            } else if (e.key === 'Escape') {
              setOpen(false)
              if (value) setSearching(false)
            }
          }}
          className={`${INPUT} pl-9`}
        />
        {loading && <Loader2 aria-hidden className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-theme-muted" />}
      </div>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Published posts"
          className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-md border border-theme-border bg-theme-bg p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          {options.map((post, i) => (
            <li
              key={post.slug}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              // mousedown, not click: the input's blur would close the list first.
              onMouseDown={(e) => {
                e.preventDefault()
                choose(post)
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer rounded p-2 ${i === active ? 'bg-theme-subtle dark:bg-neutral-800' : ''}`}
            >
              <PostRow post={post} />
            </li>
          ))}
          {!loading && options.length === 0 && (
            <li className="p-2 text-sm text-theme-muted dark:text-neutral-500">{query ? 'No published post matches.' : 'No published posts yet.'}</li>
          )}
        </ul>
      )}
      <p className={HELP}>Only published posts are listed. {value ? 'Esc keeps the current post.' : ''}</p>
    </div>
  )
}
